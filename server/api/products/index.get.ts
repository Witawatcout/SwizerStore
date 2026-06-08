import { getOptionalAuth } from "~~/server/utils/auth";
import { isAdminRole } from "~~/server/utils/adminAccess";
import { query } from "@@/server/utils/db";

function parseJson(value: any) {
  if (typeof value !== "string") return value || [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export default defineEventHandler(async (event) => {
  try {
    const auth = getOptionalAuth(event);
    const includeInactive = getQuery(event).includeInactive === "1" && isAdminRole(auth?.role);

    const rows = await query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      ${
        includeInactive
          ? ""
          : "WHERE COALESCE(p.is_active, 1) = 1 AND (p.category_id IS NULL OR (COALESCE(c.is_active, 1) = 1 AND (c.parent_id IS NULL OR COALESCE(parent.is_active, 1) = 1)))"
      }
      ORDER BY p.name ASC
    `);

    return rows.map((row: any) => ({
      ...row,
      stock: Number(row.stock || 0),
      is_active: Number(row.is_active ?? 1),
      tags: parseJson(row.tags),
      benefits: parseJson(row.benefits),
      rituals: parseJson(row.rituals),
      gallery: parseJson(row.gallery),
    }));
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
