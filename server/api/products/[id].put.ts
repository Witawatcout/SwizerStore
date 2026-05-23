import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  
  try {
    await query(
      `UPDATE products 
       SET category_id=?, name=?, description=?, price=?, unit=?, image=?, badge=?, tags=?, benefits=?, rituals=?, gallery=? 
       WHERE id=?`,
      [
        body.categoryId, body.name, body.description, body.price, body.unit, body.image, body.badge,
        JSON.stringify(body.tags || []),
        JSON.stringify(body.benefits || []),
        JSON.stringify(body.rituals || []),
        JSON.stringify(body.gallery || []),
        id
      ]
    );
    return { success: true, message: 'Product updated successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
