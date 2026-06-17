import { query } from "~~/server/utils/db";
import { sendMail } from "~~/server/utils/email";

let orderRefundSchemaReady = false;

export type RefundMethod = "omise" | "manual";

export async function ensureOrderRefundSchema() {
  if (orderRefundSchemaReady) return;

  await query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status ENUM('none','partial','full') NOT NULL DEFAULT 'none' AFTER payment_status");
  await query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER refund_status");
  await query(`
    CREATE TABLE IF NOT EXISTS order_refunds (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(50) NOT NULL,
      method ENUM('omise','manual') NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'closed',
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'THB',
      omise_refund_id VARCHAR(120) DEFAULT NULL,
      transaction_reference VARCHAR(160) DEFAULT NULL,
      bank_name VARCHAR(120) DEFAULT NULL,
      bank_account_name VARCHAR(160) DEFAULT NULL,
      bank_account_number VARCHAR(80) DEFAULT NULL,
      reason VARCHAR(255) DEFAULT NULL,
      note TEXT DEFAULT NULL,
      created_by INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      INDEX idx_order_refunds_order_id (order_id),
      INDEX idx_order_refunds_created_at (created_at)
    )
  `);

  await query(`
    UPDATE orders o
    LEFT JOIN (
      SELECT order_id, COALESCE(SUM(amount), 0) AS total_refunded
      FROM order_refunds
      GROUP BY order_id
    ) r ON r.order_id = o.id
    SET
      o.refunded_amount = COALESCE(r.total_refunded, 0),
      o.refund_status = CASE
        WHEN COALESCE(r.total_refunded, 0) <= 0 THEN 'none'
        WHEN COALESCE(r.total_refunded, 0) >= o.total THEN 'full'
        ELSE 'partial'
      END
  `);

  orderRefundSchemaReady = true;
}

export function money(value: number | string) {
  return `฿${Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function normalizeRefundAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

export async function refreshOrderRefundSummary(orderId: string) {
  await ensureOrderRefundSchema();

  await query(
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
    [orderId, orderId]
  );

  const rows = await query<{ refund_status: "none" | "partial" | "full"; refunded_amount: number }>(
    "SELECT refund_status, refunded_amount FROM orders WHERE id = ? LIMIT 1",
    [orderId]
  );
  return {
    refund_status: rows[0]?.refund_status || "none",
    refunded_amount: normalizeRefundAmount(rows[0]?.refunded_amount),
  };
}

export async function getOrderRefunds(orderId: string) {
  await ensureOrderRefundSchema();
  return query<any>(
    `SELECT
       r.*,
       u.username AS created_by_username
     FROM order_refunds r
     LEFT JOIN users u ON u.id = r.created_by
     WHERE r.order_id = ?
     ORDER BY r.created_at DESC`,
    [orderId]
  );
}

export async function sendRefundEmail(orderId: string, refundId: number) {
  await ensureOrderRefundSchema();

  const rows = await query<any>(
    `SELECT
       o.id,
       o.payment_method,
       o.total,
       o.refund_status,
       o.refunded_amount,
       c.first_name,
       c.last_name,
       c.email,
       r.method,
       r.amount,
       r.transaction_reference,
       r.bank_name,
       r.reason,
       r.created_at
     FROM order_refunds r
     JOIN orders o ON o.id = r.order_id
     JOIN customers c ON c.id = o.customer_id
     WHERE r.id = ? AND o.id = ?
     LIMIT 1`,
    [refundId, orderId]
  );

  const row = rows[0];
  if (!row?.email) return { sent: false, reason: "Customer email not found" };

  const methodLabel = row.method === "omise" ? "คืนผ่าน Omise กลับช่องทางชำระเดิม" : "คืนเงินโดยร้านค้า";
  const statusLabel = row.refund_status === "full" ? "คืนเงินครบแล้ว" : "คืนเงินบางส่วน";
  const text = [
    `แจ้งการคืนเงินคำสั่งซื้อ ${row.id}`,
    `ร้านได้ทำรายการคืนเงินจำนวน ${money(row.amount)} แล้ว`,
    `วิธีคืนเงิน: ${methodLabel}`,
    row.transaction_reference ? `เลขอ้างอิง: ${row.transaction_reference}` : "",
    row.bank_name ? `ธนาคาร: ${row.bank_name}` : "",
    row.reason ? `เหตุผล: ${row.reason}` : "",
    `ยอดคืนสะสม: ${money(row.refunded_amount)} จาก ${money(row.total)}`,
    `สถานะ: ${statusLabel}`,
  ].filter(Boolean).join("\n");

  const html = `
<!doctype html>
<html>
  <body style="margin:0;background:#eef6e9;padding:28px 12px;font-family:Arial,'Noto Sans Thai',sans-serif;color:#17210f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;">
      <tr>
        <td style="padding:0 0 14px;">
          <div style="font-size:28px;font-weight:900;letter-spacing:.04em;color:#73b72d;line-height:1;">swizer</div>
          <div style="font-size:12px;font-weight:800;letter-spacing:.34em;color:#73b72d;">SUPERFOOD</div>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border:1px solid #d8e3d1;border-radius:16px;overflow:hidden;">
          <div style="background:#10140f;padding:26px 30px;color:#ffffff;">
            <div style="font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#9bd35d;">Refund update</div>
            <h1 style="font-size:26px;line-height:1.25;margin:10px 0 8px;">แจ้งการคืนเงิน</h1>
            <p style="margin:0;color:#d7e7cf;font-size:15px;line-height:1.7;">คำสั่งซื้อ ${escapeHtml(row.id)} มีรายการคืนเงินเรียบร้อยแล้ว</p>
          </div>
          <div style="padding:26px 30px;">
            <p style="margin:0 0 18px;color:#344054;line-height:1.7;">สวัสดีคุณ ${escapeHtml(row.first_name)} ${escapeHtml(row.last_name)} ร้านได้ทำรายการคืนเงินตามรายละเอียดด้านล่าง</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f9f0;border:1px solid #dbe7cf;border-radius:12px;margin-bottom:18px;">
              <tr>
                <td style="padding:18px;">
                  <div style="font-size:13px;color:#667085;margin-bottom:4px;">จำนวนเงินคืน</div>
                  <div style="font-size:28px;font-weight:900;color:#4f8f13;">${money(row.amount)}</div>
                </td>
                <td style="padding:18px;text-align:right;">
                  <div style="font-size:13px;color:#667085;margin-bottom:4px;">สถานะ</div>
                  <div style="font-size:18px;font-weight:900;color:#17210f;">${escapeHtml(statusLabel)}</div>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr><td style="padding:7px 0;color:#667085;">วิธีคืนเงิน</td><td style="padding:7px 0;text-align:right;font-weight:800;">${escapeHtml(methodLabel)}</td></tr>
              <tr><td style="padding:7px 0;color:#667085;">ยอดคืนสะสม</td><td style="padding:7px 0;text-align:right;font-weight:800;">${money(row.refunded_amount)} / ${money(row.total)}</td></tr>
              ${row.transaction_reference ? `<tr><td style="padding:7px 0;color:#667085;">เลขอ้างอิง</td><td style="padding:7px 0;text-align:right;font-weight:800;">${escapeHtml(row.transaction_reference)}</td></tr>` : ""}
              ${row.bank_name ? `<tr><td style="padding:7px 0;color:#667085;">ธนาคาร</td><td style="padding:7px 0;text-align:right;font-weight:800;">${escapeHtml(row.bank_name)}</td></tr>` : ""}
              ${row.reason ? `<tr><td style="padding:7px 0;color:#667085;">เหตุผล</td><td style="padding:7px 0;text-align:right;font-weight:800;">${escapeHtml(row.reason)}</td></tr>` : ""}
            </table>
            <p style="margin:22px 0 0;color:#667085;font-size:13px;line-height:1.7;">หากมีข้อสงสัย กรุณาติดต่อทีมงานพร้อมแจ้งเลขคำสั่งซื้อ ${escapeHtml(row.id)}</p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const result = await sendMail({
    to: [row.email],
    subject: `แจ้งการคืนเงินคำสั่งซื้อ ${row.id} | SwizerStore`,
    html,
    text,
  });

  return { sent: !result.skipped, reason: result.reason };
}
