import { getOptionalAuth } from "~~/server/utils/auth";
import { isAdminRole } from "~~/server/utils/adminAccess";
import { query } from "@@/server/utils/db";
import { ensureProductPricingSchema, getProductCategoryMap } from "~~/server/utils/products";

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
    await ensureProductPricingSchema();
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
    const categoryMap = await getProductCategoryMap(rows.map((row: any) => row.id));

    return rows.map((row: any) => ({
      ...row,
      price: Number(row.price || 0),
      sale_price: row.sale_price === null ? null : Number(row.sale_price),
      stock: Number(row.stock || 0),
      is_active: Number(row.is_active ?? 1),
      is_featured: Number(row.is_featured ?? 0),
      featured_order: Number(row.featured_order ?? 0),
      category_ids: categoryMap.get(String(row.id)) || (row.category_id ? [String(row.category_id)] : []),
      tags: parseJson(row.tags),
      benefits: parseJson(row.benefits),
      rituals: parseJson(row.rituals),
      gallery: parseJson(row.gallery),
    }));
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
