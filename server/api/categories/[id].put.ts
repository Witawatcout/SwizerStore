import { query } from '@@/server/utils/db';
import { ensureCategoryStatusSchema, normalizeCategoryColor } from '~~/server/utils/categories';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');
  const body = await readBody(event);
  const isActive = body.is_active === false || body.is_active === 0 ? 0 : 1;
  const color = normalizeCategoryColor(body.color);
  
  try {
    await ensureCategoryStatusSchema();

    await query(
      'UPDATE categories SET name=?, slug=?, parent_id=?, is_active=?, color=? WHERE id=?',
      [body.name, body.slug, body.parentId || null, isActive, color, id]
    );
    return { success: true, message: 'Category updated successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
