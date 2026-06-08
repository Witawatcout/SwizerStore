import { requireSuperAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event);

  const id = decodeURIComponent(getRouterParam(event, "id") || "");
  const rows = await query<any>(
    `SELECT
       o.*,
       c.id AS customer_id,
       c.user_id,
       c.first_name,
       c.last_name,
       c.email,
       c.phone,
       c.address,
       c.address_line2,
       c.subdistrict,
       c.district,
       c.province,
       c.postal_code,
       c.delivery_note
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  const items = await query<any>(
    "SELECT product_id, product_name, unit_price, quantity, subtotal FROM order_items WHERE order_id = ?",
    [id]
  );

  return { ...rows[0], items };
});
