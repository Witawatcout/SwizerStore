import type { PoolConnection } from "mysql2/promise";
import { getPool } from "~~/server/utils/db";
import { randomBytes } from "node:crypto";
import { sendOrderPaidEmails } from "~~/server/utils/orderEmails";

interface OrderIdItem {
  product_id: string;
  category_id: string;
}

function normalizeOrderCode(value: string) {
  return String(value || "")
    .trim()
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

function categoryCode(categoryId: string) {
  const normalized = normalizeOrderCode(categoryId).replace(/-/g, "");
  return normalized.slice(0, 8) || "UNCAT";
}

function productCode(productId: string, categoryId: string) {
  const normalizedProduct = normalizeOrderCode(productId);
  const normalizedCategory = normalizeOrderCode(categoryId);
  const withoutCategory = normalizedProduct.startsWith(`${normalizedCategory}-`)
    ? normalizedProduct.slice(normalizedCategory.length + 1)
    : normalizedProduct;
  return withoutCategory.replace(/-/g, "").slice(0, 10) || "PRODUCT";
}

export async function generateOrderId(conn: PoolConnection, items: OrderIdItem[]) {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const uniqueCategories = [...new Set(items.map((item) => String(item.category_id || "").trim()))];
  const uniqueProducts = [...new Map(items.map((item) => [item.product_id, item])).values()];
  const categoryPart = uniqueCategories.length === 1
    ? categoryCode(uniqueCategories[0])
    : `MIX${uniqueCategories.length}`;
  const productPart = uniqueProducts.length === 1
    ? productCode(uniqueProducts[0].product_id, uniqueProducts[0].category_id)
    : `P${String(uniqueProducts.length).padStart(2, "0")}`;

  for (let attempt = 0; attempt < 8; attempt++) {
    const suffix = randomBytes(2).toString("hex").toUpperCase();
    const id = `ORD-${datePart}-${categoryPart}-${productPart}-${suffix}`;
    const [rows] = await conn.execute<any[]>("SELECT id FROM orders WHERE id = ? LIMIT 1", [id]);
    if (!rows.length) return id;
  }

  throw createError({ statusCode: 500, statusMessage: "Could not generate order id" });
}

export async function expirePromptPayReservations(conn?: PoolConnection) {
  const executor = conn || getPool();
  await executor.execute(
    `UPDATE orders
     SET payment_status = 'failed', status = 'cancelled'
     WHERE payment_method = 'promptpay'
       AND payment_status = 'pending'
       AND expires_at IS NOT NULL
       AND expires_at <= CURRENT_TIMESTAMP`
  );
}

export async function markOrderPaymentSuccess(orderId: string, chargeId?: string | null) {
  const pool = getPool();
  const conn = await pool.getConnection();
  let shouldSendEmail = false;

  try {
    await conn.beginTransaction();

    const [orders] = await conn.execute<any[]>(
      "SELECT payment_status, status, confirmation_email_sent_at FROM orders WHERE id = ? FOR UPDATE",
      [orderId]
    );

    if (!orders.length) {
      throw createError({ statusCode: 404, statusMessage: "Order not found" });
    }

    if (orders[0].status === "cancelled") {
      await conn.commit();
      return;
    }

    if (orders[0].payment_status !== "success") {
      await conn.execute(
        "UPDATE orders SET payment_status = 'success', status = 'paid', omise_charge_id = COALESCE(?, omise_charge_id) WHERE id = ?",
        [chargeId || null, orderId]
      );

      await conn.execute(
        `UPDATE products p
         JOIN order_items oi ON oi.product_id = p.id
         SET p.stock = GREATEST(p.stock - oi.quantity, 0)
         WHERE oi.order_id = ?`,
        [orderId]
      );

      shouldSendEmail = true;
    } else if (!orders[0].confirmation_email_sent_at) {
      shouldSendEmail = true;
    }

    await conn.commit();

    if (shouldSendEmail) {
      try {
        await sendOrderPaidEmails(orderId);
      } catch (error) {
        console.warn(`Failed to send paid order email for ${orderId}`, error);
      }
    }
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function markOrderPaymentFailed(orderId: string, chargeId?: string | null) {
  await getPool().execute(
    "UPDATE orders SET payment_status = 'failed', status = 'cancelled', omise_charge_id = COALESCE(?, omise_charge_id) WHERE id = ? AND payment_status <> 'success'",
    [chargeId || null, orderId]
  );
}
