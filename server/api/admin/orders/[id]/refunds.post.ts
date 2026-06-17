import { requireSuperAdmin } from "~~/server/utils/auth";
import { getPool } from "~~/server/utils/db";
import { createRefund, toSatang } from "~~/server/utils/omise";
import {
  ensureOrderRefundSchema,
  normalizeRefundAmount,
  sendRefundEmail,
} from "~~/server/utils/orderRefunds";

function cleanText(value: unknown, maxLength = 255) {
  const text = String(value || "").trim();
  return text ? text.slice(0, maxLength) : null;
}

export default defineEventHandler(async (event) => {
  const auth = requireSuperAdmin(event);
  await ensureOrderRefundSchema();

  const id = decodeURIComponent(getRouterParam(event, "id") || "");
  const body = await readBody(event);
  const amount = normalizeRefundAmount(body?.amount);

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Order ID is required" });
  }
  if (amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Refund amount must be greater than 0" });
  }

  const conn = await getPool().getConnection();
  let refundId = 0;
  let total = 0;
  let method = "manual";
  let omiseRefundId: string | null = null;
  let omisePayload: any = null;
  let summary = { refund_status: "none" as "none" | "partial" | "full", refunded_amount: 0 };

  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<any[]>(
      `SELECT id, payment_method, payment_status, total, refunded_amount, omise_charge_id
       FROM orders
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [id]
    );
    const order = rows[0];

    if (!order) {
      throw createError({ statusCode: 404, statusMessage: "Order not found" });
    }
    if (order.payment_status !== "success") {
      throw createError({ statusCode: 400, statusMessage: "Only paid orders can be refunded" });
    }

    total = normalizeRefundAmount(order.total);
    const alreadyRefunded = normalizeRefundAmount(order.refunded_amount);
    const remaining = Math.max(0, Math.round((total - alreadyRefunded) * 100) / 100);

    if (amount > remaining) {
      throw createError({
        statusCode: 400,
        statusMessage: `Refund amount cannot exceed remaining amount (${remaining.toFixed(2)} THB)`,
      });
    }

    let status = "closed";
    let transactionReference = cleanText(body?.transaction_reference, 160);

    if (order.payment_method === "credit_card") {
      if (!order.omise_charge_id) {
        throw createError({ statusCode: 400, statusMessage: "This order has no Omise charge ID" });
      }

      method = "omise";
      omisePayload = await createRefund({
        chargeId: order.omise_charge_id,
        amount: toSatang(amount),
      });
      omiseRefundId = omisePayload?.id || null;
      status = omisePayload?.status || (omisePayload?.voided ? "voided" : "closed");
      transactionReference =
        cleanText(omisePayload?.transaction, 160) ||
        cleanText(omisePayload?.acquirer_reference_number, 160) ||
        transactionReference;
    } else if (order.payment_method !== "promptpay") {
      throw createError({ statusCode: 400, statusMessage: "This payment method cannot be refunded here" });
    }

    const [result] = await conn.execute<any>(
      `INSERT INTO order_refunds
         (order_id, amount, method, status, reason, note, omise_refund_id, transaction_reference, bank_name, bank_account_name, bank_account_number, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        amount,
        method,
        status,
        cleanText(body?.reason, 120),
        cleanText(body?.note, 1000),
        omiseRefundId,
        transactionReference,
        cleanText(body?.bank_name, 120),
        cleanText(body?.bank_account_name, 160),
        cleanText(body?.bank_account_number, 80),
        auth.id || null,
      ]
    );
    refundId = Number(result?.insertId || 0);

    await conn.execute(
      `UPDATE orders o
       LEFT JOIN (
         SELECT order_id, COALESCE(SUM(amount), 0) AS total_refunded
         FROM order_refunds
         WHERE order_id = ?
         GROUP BY order_id
       ) r ON r.order_id = o.id
       SET
         o.refunded_amount = COALESCE(r.total_refunded, 0),
         o.refund_status = CASE
           WHEN COALESCE(r.total_refunded, 0) <= 0 THEN 'none'
           WHEN COALESCE(r.total_refunded, 0) >= o.total THEN 'full'
           ELSE 'partial'
         END
       WHERE o.id = ?`,
      [id, id]
    );

    const [summaryRows] = await conn.execute<any[]>(
      "SELECT refund_status, refunded_amount FROM orders WHERE id = ? LIMIT 1",
      [id]
    );
    summary = {
      refund_status: summaryRows[0]?.refund_status || "none",
      refunded_amount: normalizeRefundAmount(summaryRows[0]?.refunded_amount),
    };

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  let email: any = { sent: false, skipped: true };

  if (body?.send_email !== false && refundId) {
    try {
      email = await sendRefundEmail(id, refundId);
    } catch (error: any) {
      email = { sent: false, error: error?.message || "Email delivery failed" };
    }
  }

  return {
    success: true,
    refundId,
    refund_status: summary.refund_status,
    refunded_amount: summary.refunded_amount,
    remaining_amount: Math.max(0, Math.round((total - summary.refunded_amount) * 100) / 100),
    method,
    omiseRefundId,
    omise: omisePayload,
    email,
  };
});
