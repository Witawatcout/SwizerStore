import bcrypt from "bcryptjs";
import { requireAuth } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

interface ShippingBody {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  address_line2?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postal_code?: string;
  delivery_note?: string;
}

interface UpdateBody {
  email?: string;
  password?: string;
  shipping?: ShippingBody;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNullable(value: unknown) {
  const text = cleanText(value);
  return text || null;
}

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const body = await readBody<UpdateBody>(event);

  if (!auth.id) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (body.email !== undefined) {
    const email = cleanText(body.email);
    if (!email) {
      throw createError({ statusCode: 400, statusMessage: "Email is required" });
    }
    updates.push("email = ?");
    params.push(email);
  }

  if (body.password) {
    if (body.password.length < 6) {
      throw createError({ statusCode: 400, statusMessage: "Password must be at least 6 characters" });
    }
    const hashed = await bcrypt.hash(body.password, 12);
    updates.push("password = ?");
    params.push(hashed);
  }

  if (updates.length) {
    params.push(auth.id);
    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
  }

  if (body.shipping) {
    const shipping = {
      first_name: cleanText(body.shipping.first_name),
      last_name: cleanText(body.shipping.last_name),
      email: cleanText(body.shipping.email || body.email || auth.email),
      phone: cleanText(body.shipping.phone),
      address: cleanText(body.shipping.address),
      address_line2: cleanNullable(body.shipping.address_line2),
      subdistrict: cleanNullable(body.shipping.subdistrict),
      district: cleanText(body.shipping.district),
      province: cleanText(body.shipping.province),
      postal_code: cleanText(body.shipping.postal_code),
      delivery_note: cleanNullable(body.shipping.delivery_note),
    };

    const requiredFields = ["first_name", "last_name", "email", "phone", "address", "district", "province", "postal_code"] as const;
    for (const field of requiredFields) {
      if (!shipping[field]) {
        throw createError({ statusCode: 400, statusMessage: `${field} is required` });
      }
    }

    await query(
      `INSERT INTO user_shipping_profiles
       (user_id, first_name, last_name, email, phone, address, address_line2, subdistrict, district, province, postal_code, delivery_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         first_name = VALUES(first_name),
         last_name = VALUES(last_name),
         email = VALUES(email),
         phone = VALUES(phone),
         address = VALUES(address),
         address_line2 = VALUES(address_line2),
         subdistrict = VALUES(subdistrict),
         district = VALUES(district),
         province = VALUES(province),
         postal_code = VALUES(postal_code),
         delivery_note = VALUES(delivery_note)`,
      [
        auth.id,
        shipping.first_name,
        shipping.last_name,
        shipping.email,
        shipping.phone,
        shipping.address,
        shipping.address_line2,
        shipping.subdistrict,
        shipping.district,
        shipping.province,
        shipping.postal_code,
        shipping.delivery_note,
      ]
    );
  }

  return { success: true, message: "Profile updated" };
});
