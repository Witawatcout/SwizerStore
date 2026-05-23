import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, name, slug, parentId } = body;

  try {
    await query(
      'INSERT INTO categories (id, name, slug, parent_id) VALUES (?, ?, ?, ?)',
      [id, name, slug, parentId || null]
    );
    return { success: true, message: 'Category created successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
