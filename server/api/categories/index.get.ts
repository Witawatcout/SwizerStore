import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const categories = await query('SELECT * FROM categories');
    return categories;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
