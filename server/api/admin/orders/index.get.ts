import { requireSuperAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";
import { ensureOrderTrackingSchema } from "~~/server/utils/orderTracking";

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event);
  await ensureOrderTrackingSchema();

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
  if (filters.category_id) {
    where.push(`EXISTS (
      SELECT 1
      FROM order_items category_oi
      JOIN products category_p ON category_p.id = category_oi.product_id
      WHERE category_oi.order_id = o.id
        AND category_p.category_id = ?
    )`);
    params.push(filters.category_id);
  }
  if (filters.date) {
    where.push("DATE(o.created_at) = ?");
    params.push(filters.date);
  }

  const search = String(filters.search || "").trim().slice(0, 100);
  if (search) {
    const searchValue = `%${search}%`;
    where.push(`(
      o.id LIKE ?
      OR o.tracking_number LIKE ?
      OR CONCAT_WS(' ', c.first_name, c.last_name) LIKE ?
      OR c.email LIKE ?
      OR c.phone LIKE ?
      OR EXISTS (
        SELECT 1
        FROM order_items search_oi
        LEFT JOIN products search_p ON search_p.id = search_oi.product_id
        LEFT JOIN categories search_c ON search_c.id = search_p.category_id
        WHERE search_oi.order_id = o.id
          AND (
            search_oi.product_id LIKE ?
            OR search_oi.product_name LIKE ?
            OR TRIM(search_p.category_id) LIKE ?
            OR search_c.name LIKE ?
            OR TRIM(search_c.slug) LIKE ?
          )
      )
    )`);
    params.push(...Array(10).fill(searchValue));
  }

  const usesPagination = filters.page !== undefined || filters.page_size !== undefined || filters.search !== undefined;
  const pageSize = Math.min(Math.max(Number.parseInt(String(filters.page_size || "10"), 10) || 10, 1), 100);
  const requestedPage = Math.max(Number.parseInt(String(filters.page || "1"), 10) || 1, 1);
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  let page = requestedPage;
  let total = 0;
  if (usesPagination) {
    const countRows = await query<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ${whereSql}`,
      params
    );
    total = Number(countRows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    page = Math.min(page, totalPages);
  }

  const paginationSql = usesPagination ? `LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}` : "";

  const rows = await query<any>(
    `SELECT
       o.id,
       o.status,
       o.tracking_number,
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
     ${whereSql}
     ORDER BY o.created_at DESC
     ${paginationSql}`,
    params
  );

  if (!usesPagination) return rows;

  return {
    items: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
});
