import { query } from '@@/server/utils/db';
import { ensureCategoryStatusSchema } from '~~/server/utils/categories';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, name, slug, parentId } = body;
  const isActive = body.is_active === false || body.is_active === 0 ? 0 : 1;

  try {
    await ensureCategoryStatusSchema();

    await query(
      'INSERT INTO categories (id, name, slug, parent_id, is_active) VALUES (?, ?, ?, ?, ?)',
      [id, name, slug, parentId || null, isActive]
    );
    return { success: true, message: 'Category created successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
