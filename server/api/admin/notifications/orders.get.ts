import { requireAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const countRows = await query<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM orders
     WHERE payment_status = 'success'
       AND admin_seen_at IS NULL`
  );

  const recent = await query<any>(
    `SELECT
       o.id,
       o.total,
       o.payment_method,
       o.created_at,
       CONCAT(c.first_name, ' ', c.last_name) AS customer_name
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.payment_status = 'success'
       AND o.admin_seen_at IS NULL
     ORDER BY o.created_at DESC
     LIMIT 5`
  );

  return {
    count: Number(countRows[0]?.count || 0),
    recent,
  };
});
