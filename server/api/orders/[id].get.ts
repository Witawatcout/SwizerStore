import { getOptionalAuth } from "~~/server/utils/auth";
import { isSuperAdminRole } from "~~/server/utils/adminAccess";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, "id") || "");
  const auth = getOptionalAuth(event);

  const rows = await query<any>(
    `SELECT
       o.*,
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

  const order = rows[0];
  const canViewPrivate = isSuperAdminRole(auth?.role) || (auth?.id && Number(order.user_id) === Number(auth.id));
  const items = await query<any>("SELECT product_id, product_name, unit_price, quantity, subtotal FROM order_items WHERE order_id = ?", [id]);

  const publicOrder = {
    id: order.id,
    status: order.status,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    subtotal: Number(order.subtotal),
    shipping_fee: Number(order.shipping_fee),
    total: Number(order.total),
    created_at: order.created_at,
    updated_at: order.updated_at,
    expires_at: order.expires_at,
    promptpay_qr_url: order.promptpay_qr_url,
    items,
  };

  if (!canViewPrivate) return publicOrder;

  return {
    ...publicOrder,
    customer: {
      first_name: order.first_name,
      last_name: order.last_name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      address_line2: order.address_line2,
      subdistrict: order.subdistrict,
      district: order.district,
      province: order.province,
      postal_code: order.postal_code,
      delivery_note: order.delivery_note,
    },
    omise_charge_id: order.omise_charge_id,
    omise_source_id: order.omise_source_id,
    note: order.note,
  };
});
