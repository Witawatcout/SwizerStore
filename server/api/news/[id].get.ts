import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');

  try {
    const rows = await query('SELECT * FROM news WHERE id=?', [id]) as any[];
    if (!rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'News not found' });
    }
    return rows[0];
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
