import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');

  try {
    await query('UPDATE products SET is_active = 0 WHERE id=?', [id]);
    return { success: true, message: 'Product deactivated successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
