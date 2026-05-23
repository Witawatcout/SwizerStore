import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  
  try {
    await query('DELETE FROM products WHERE id=?', [id]);
    return { success: true, message: 'Product deleted successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
