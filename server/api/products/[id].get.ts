import { query } from '@@/server/utils/db';
import { getOptionalAuth } from '~~/server/utils/auth';
import { isAdminRole } from '~~/server/utils/adminAccess';
import { ensureProductPricingSchema, getProductCategoryMap } from '~~/server/utils/products';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');
  const auth = getOptionalAuth(event);

  try {
    await ensureProductPricingSchema();
    const rows = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN categories parent ON c.parent_id = parent.id
       WHERE p.id = ?
       ${isAdminRole(auth?.role) ? '' : 'AND COALESCE(p.is_active, 1) = 1 AND (p.category_id IS NULL OR (COALESCE(c.is_active, 1) = 1 AND (c.parent_id IS NULL OR COALESCE(parent.is_active, 1) = 1)))'}`,
      [id]
    );

    if (rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' });
    }

    const row = rows[0] as any;
    const categoryMap = await getProductCategoryMap([row.id]);
    return {
      ...row,
      price: Number(row.price || 0),
      sale_price: row.sale_price === null ? null : Number(row.sale_price),
      stock: Number(row.stock || 0),
      is_active: Number(row.is_active ?? 1),
      is_featured: Number(row.is_featured ?? 0),
      featured_order: Number(row.featured_order ?? 0),
      category_ids: categoryMap.get(String(row.id)) || (row.category_id ? [String(row.category_id)] : []),
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      benefits: typeof row.benefits === 'string' ? JSON.parse(row.benefits) : row.benefits,
      rituals: typeof row.rituals === 'string' ? JSON.parse(row.rituals) : row.rituals,
      gallery: typeof row.gallery === 'string' ? JSON.parse(row.gallery) : row.gallery,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
