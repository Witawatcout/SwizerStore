import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, tag, date, title, desc, image, content } = body;

  try {
    await query(
      'INSERT INTO news (id, tag, date, title, `desc`, image, content) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, tag, date, title, desc, image, content]
    );
    return { success: true, message: 'News created successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
