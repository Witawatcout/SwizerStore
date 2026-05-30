import { requireAuth } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);

  if (!auth.id) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const rows = await query<any>(
    `SELECT
       o.id,
       o.status,
       o.payment_method,
       o.payment_status,
       o.promptpay_qr_url,
       o.subtotal,
       o.shipping_fee,
       o.total,
       o.expires_at,
       o.created_at,
       COUNT(oi.id) AS item_count
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE c.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [auth.id]
  );

  return rows;
});
