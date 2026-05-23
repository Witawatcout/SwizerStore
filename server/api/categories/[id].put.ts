import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  
  try {
    await query(
      'UPDATE categories SET name=?, slug=?, parent_id=? WHERE id=?',
      [body.name, body.slug, body.parentId || null, id]
    );
    return { success: true, message: 'Category updated successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
