import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, categoryId, name, description, price, unit, image, badge, tags, benefits, rituals, gallery } = body;

  try {
    await query(
      `INSERT INTO products (id, category_id, name, description, price, unit, image, badge, tags, benefits, rituals, gallery) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, categoryId, name, description, price, unit, image, badge, 
        JSON.stringify(tags || []), 
        JSON.stringify(benefits || []), 
        JSON.stringify(rituals || []), 
        JSON.stringify(gallery || [])
      ]
    );
    return { success: true, message: 'Product created successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
