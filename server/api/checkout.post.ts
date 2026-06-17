import { getOptionalAuth } from "~~/server/utils/auth";
import { getPool } from "~~/server/utils/db";
import { ensureProductPricingSchema, effectiveProductPrice } from "~~/server/utils/products";
import { createCardCharge, createPromptPaySource, createSourceCharge, isChargeSuccessful, toSatang } from "~~/server/utils/omise";
import { expirePromptPayReservations, generateOrderId, markOrderPaymentFailed, markOrderPaymentSuccess } from "~~/server/utils/orders";
import { checkRateLimit, getRateLimitInfo } from "~~/server/utils/rateLimit";

interface CheckoutItem {
  id: string;
  quantity: number;
}

interface CheckoutBody {
  token?: string;
  paymentMethod: "credit_card" | "promptpay";
  customerData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    address_line2?: string;
    subdistrict?: string;
    district: string;
    province: string;
    postal_code: string;
    delivery_note?: string;
  };
  orderData: {
    items: CheckoutItem[];
    note?: string;
  };
}

const SHIPPING_FEE = 0;

function requireText(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw createError({ statusCode: 400, statusMessage: `${field} is required` });
  }
  return value.trim();
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  if (!checkRateLimit(`checkout:${ip}`)) {
    const info = getRateLimitInfo(`checkout:${ip}`);
    setResponseHeader(event, "Retry-After", String(Math.ceil(info.resetIn / 1000)));
    throw createError({ statusCode: 429, statusMessage: "Too many checkout attempts. Please try again later." });
  }

  const auth = getOptionalAuth(event);
  const body = await readBody<CheckoutBody>(event);

  if (!["credit_card", "promptpay"].includes(body.paymentMethod)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid payment method" });
  }
  if (body.paymentMethod === "credit_card" && !body.token) {
    throw createError({ statusCode: 400, statusMessage: "Card token is required" });
  }

  const customer = {
    first_name: requireText(body.customerData?.first_name, "first_name"),
    last_name: requireText(body.customerData?.last_name, "last_name"),
    email: requireText(body.customerData?.email, "email"),
    phone: requireText(body.customerData?.phone, "phone"),
    address: requireText(body.customerData?.address, "address"),
    address_line2: optionalText(body.customerData?.address_line2),
    subdistrict: optionalText(body.customerData?.subdistrict),
    district: requireText(body.customerData?.district, "district"),
    province: requireText(body.customerData?.province, "province"),
    postal_code: requireText(body.customerData?.postal_code, "postal_code"),
    delivery_note: optionalText(body.customerData?.delivery_note),
  };

  const items = (body.orderData?.items || [])
    .map((item) => ({ id: String(item.id), quantity: Number(item.quantity) }))
    .filter((item) => item.id && Number.isInteger(item.quantity) && item.quantity > 0);

  if (!items.length) {
    throw createError({ statusCode: 400, statusMessage: "Cart is empty" });
  }

  await ensureProductPricingSchema();
  const pool = getPool();
  const conn = await pool.getConnection();
  let orderId = "";
  let transactionOpen = false;

  try {
    await conn.beginTransaction();
    transactionOpen = true;
    await expirePromptPayReservations(conn);

    const placeholders = items.map(() => "?").join(",");
    const [products] = await conn.execute<any[]>(
      `SELECT id, category_id, name, price, sale_price, stock, is_active
       FROM products
       WHERE id IN (${placeholders}) FOR UPDATE`,
      items.map((item) => item.id)
    );

    const [reservedRows] = await conn.execute<any[]>(
      `SELECT oi.product_id, SUM(oi.quantity) AS reserved_quantity
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.product_id IN (${placeholders})
         AND o.payment_method = 'promptpay'
         AND o.payment_status = 'pending'
         AND o.expires_at > CURRENT_TIMESTAMP
       GROUP BY oi.product_id`,
      items.map((item) => item.id)
    );

    const reservedMap = new Map(
      reservedRows.map((row) => [String(row.product_id), Number(row.reserved_quantity || 0)])
    );

    const productMap = new Map(products.map((product) => [String(product.id), product]));
    const orderItems = items.map((item) => {
      const product = productMap.get(item.id);
      if (!product || Number(product.is_active) === 0) {
        throw createError({ statusCode: 400, statusMessage: `Product ${item.id} is not available` });
      }
      const availableStock = Number(product.stock) - (reservedMap.get(item.id) || 0);
      if (availableStock < item.quantity) {
        throw createError({ statusCode: 400, statusMessage: `${product.name} has only ${Math.max(availableStock, 0)} item(s) available` });
      }

      const unitPrice = effectiveProductPrice(product.price, product.sale_price);
      return {
        product_id: item.id,
        category_id: String(product.category_id || "").trim(),
        product_name: product.name,
        unit_price: unitPrice,
        quantity: item.quantity,
        subtotal: unitPrice * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal + SHIPPING_FEE;

    const [customerResult] = await conn.execute<any>(
      `INSERT INTO customers
       (user_id, first_name, last_name, email, phone, address, address_line2, subdistrict, district, province, postal_code, delivery_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auth?.id || null,
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone,
        customer.address,
        customer.address_line2,
        customer.subdistrict,
        customer.district,
        customer.province,
        customer.postal_code,
        customer.delivery_note,
      ]
    );

    orderId = await generateOrderId(conn, orderItems);

    await conn.execute(
      `INSERT INTO orders
       (id, customer_id, status, payment_method, payment_status, subtotal, shipping_fee, total, note, expires_at)
       VALUES (?, ?, 'pending', ?, 'pending', ?, ?, ?, ?, ${body.paymentMethod === "promptpay" ? "DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE)" : "NULL"})`,
      [
        orderId,
        customerResult.insertId,
        body.paymentMethod,
        subtotal,
        SHIPPING_FEE,
        total,
        body.orderData?.note || null,
      ]
    );

    for (const item of orderItems) {
      await conn.execute(
        `INSERT INTO order_items
         (order_id, product_id, product_name, unit_price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.unit_price, item.quantity, item.subtotal]
      );
    }

    await conn.commit();
    transactionOpen = false;

    const amount = toSatang(total);
    const description = `SwizerStore order ${orderId}`;

    if (body.paymentMethod === "credit_card") {
      const charge = await createCardCharge({ amount, token: body.token!, description });
      const isSuccess = isChargeSuccessful(charge);

      if (!isSuccess) {
        await markOrderPaymentFailed(orderId, charge.id);
        throw createError({ statusCode: 402, statusMessage: charge.failure_message || "Payment failed" });
      }

      await markOrderPaymentSuccess(orderId, charge.id);
      return {
        success: true,
        orderId,
        paymentStatus: "success",
        redirectUrl: `/order/${orderId}/success`,
      };
    }

    const config = useRuntimeConfig();
    const source = await createPromptPaySource({ amount });
    const charge = await createSourceCharge({
      amount,
      sourceId: source.id,
      returnUri: `${config.baseUrl}/order/${orderId}/callback`,
      description,
    });
    const qrCodeUrl =
      charge?.source?.scannable_code?.image?.download_uri ||
      source?.scannable_code?.image?.download_uri ||
      null;

    await getPool().execute(
      "UPDATE orders SET omise_source_id = ?, omise_charge_id = ?, promptpay_qr_url = ? WHERE id = ?",
      [source.id, charge.id, qrCodeUrl, orderId]
    );

    return {
      success: true,
      orderId,
      paymentStatus: "pending",
      qrCodeUrl,
      expiresIn: 15 * 60,
    };
  } catch (error) {
    if (transactionOpen) {
      await conn.rollback().catch(() => {});
    }
    if (orderId) {
      await markOrderPaymentFailed(orderId).catch(() => {});
    }
    throw error;
  } finally {
    conn.release();
  }
});
