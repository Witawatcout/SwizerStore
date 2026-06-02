import type { PoolConnection } from "mysql2/promise";
import { getPool } from "~~/server/utils/db";
import { randomBytes } from "node:crypto";
import { sendOrderPaidEmails } from "~~/server/utils/orderEmails";

export async function generateOrderId(conn: PoolConnection) {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  for (let attempt = 0; attempt < 8; attempt++) {
    const suffix = randomBytes(4).toString("base64url").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6);
    const id = `ORD-${datePart}-${suffix}`;
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
