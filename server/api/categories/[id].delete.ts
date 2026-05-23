import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  
  try {
    await query('DELETE FROM categories WHERE id=?', [id]);
    return { success: true, message: 'Category deleted successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
