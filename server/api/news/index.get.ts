import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const rows = await query('SELECT * FROM news ORDER BY created_at DESC');
    return rows;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
