import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { categoryId, name, description, price, unit, image, badge, tags, benefits, rituals, gallery } = body;
  const id = body.id || String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  const stock = Number(body.stock || 0);
  const isActive = body.is_active === false || body.isActive === false || body.is_active === 0 ? 0 : 1;

  if (!id || !name || Number(price) <= 0 || stock < 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product data" });
  }

  try {
    await query(
      `INSERT INTO products (id, category_id, name, description, price, stock, is_active, unit, image, badge, tags, benefits, rituals, gallery) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, categoryId, name, description, price, stock, isActive, unit, image, badge, 
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
