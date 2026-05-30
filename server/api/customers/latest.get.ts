import { requireAuth } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);

  if (!auth.id) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const profiles = await query<any>(
    `SELECT first_name, last_name, email, phone, address, address_line2, subdistrict, district, province, postal_code, delivery_note
     FROM user_shipping_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [auth.id]
  );

  if (profiles.length) {
    return { customer: profiles[0], source: "profile" };
  }

  const rows = await query<any>(
    `SELECT first_name, last_name, email, phone, address, address_line2, subdistrict, district, province, postal_code, delivery_note
     FROM customers
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [auth.id]
  );

  return { customer: rows[0] || null, source: rows[0] ? "latest_order" : null };
});
