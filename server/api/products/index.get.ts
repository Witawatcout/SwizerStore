import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // ดึงสินค้าพร้อมชื่อ Category
    const rows = await query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `);
    
    // แปลงข้อมูล JSON กลับเป็น Object ก่อนส่งไปหน้าบ้าน
    const products = rows.map((row: any) => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      benefits: typeof row.benefits === 'string' ? JSON.parse(row.benefits) : row.benefits,
      rituals: typeof row.rituals === 'string' ? JSON.parse(row.rituals) : row.rituals,
      gallery: typeof row.gallery === 'string' ? JSON.parse(row.gallery) : row.gallery,
    }));

    return products;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
