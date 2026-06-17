import { query } from '@@/server/utils/db';
import { ensureProductPricingSchema, normalizeFeaturedOrder, normalizeSalePrice, syncProductCategories } from '~~/server/utils/products';

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
  const isFeatured = body.is_featured === true || body.isFeatured === true || body.is_featured === 1 ? 1 : 0;
  const featuredOrder = isFeatured ? normalizeFeaturedOrder(body.featured_order ?? body.featuredOrder) : 0;
  const rawSalePrice = body.salePrice ?? body.sale_price;
  const salePrice = normalizeSalePrice(rawSalePrice, price);

  if (!id || !categoryId || !name || Number(price) <= 0 || stock < 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product data" });
  }
  if (rawSalePrice !== null && rawSalePrice !== undefined && rawSalePrice !== '' && salePrice === null) {
    throw createError({ statusCode: 400, statusMessage: 'ราคาลดเหลือต้องมากกว่า 0 และต่ำกว่าราคาปกติ' });
  }

  try {
    await ensureProductPricingSchema();
    await query(
      `INSERT INTO products (id, category_id, name, description, price, sale_price, stock, is_active, is_featured, featured_order, unit, image, badge, tags, benefits, rituals, gallery) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, categoryId, name, description, price, salePrice, stock, isActive, isFeatured, featuredOrder, unit, image, badge, 
        JSON.stringify(tags || []), 
        JSON.stringify(benefits || []), 
        JSON.stringify(rituals || []), 
        JSON.stringify(gallery || [])
      ]
    );
    await syncProductCategories(id, categoryId, body.additionalCategoryIds ?? body.category_ids);
    return { success: true, message: 'Product created successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
