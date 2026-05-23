import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');

  try {
    const rows = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' });
    }

    const row = rows[0] as any;
    return {
      ...row,
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
