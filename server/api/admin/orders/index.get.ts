import { requireSuperAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event);

  const filters = getQuery(event);
  const where: string[] = [];
  const params: any[] = [];

  if (filters.status) {
    where.push("o.status = ?");
    params.push(filters.status);
  }
  if (filters.payment_method) {
    where.push("o.payment_method = ?");
    params.push(filters.payment_method);
  }
  if (filters.date) {
    where.push("DATE(o.created_at) = ?");
    params.push(filters.date);
  }

  const rows = await query<any>(
    `SELECT
       o.id,
       o.status,
       o.payment_method,
       o.payment_status,
       o.subtotal,
       o.shipping_fee,
       o.total,
       o.expires_at,
       o.created_at,
       o.updated_at,
       CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
       c.email,
       c.phone
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY o.created_at DESC`,
    params
  );

  return rows;
});
