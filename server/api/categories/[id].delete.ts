import { query } from '@@/server/utils/db';
import { ensureCategoryStatusSchema } from '~~/server/utils/categories';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรหัสหมวดหมู่ที่ต้องการลบ' });
  }
  
  try {
    await ensureCategoryStatusSchema();

    const products = await query<{ total: number }>('SELECT COUNT(*) AS total FROM products WHERE category_id=?', [id]);
    const productCount = Number(products[0]?.total || 0);

    if (productCount > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `ยังลบหมวดหมู่นี้ไม่ได้ เพราะมีสินค้า ${productCount} รายการใช้งานอยู่ กรุณาย้ายสินค้าไปหมวดหมู่อื่นก่อน`,
      });
    }

    const children = await query<{ total: number }>('SELECT COUNT(*) AS total FROM categories WHERE parent_id=?', [id]);
    const childCount = Number(children[0]?.total || 0);

    if (childCount > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `ยังลบหมวดหมู่นี้ไม่ได้ เพราะมีหมวดหมู่ย่อย ${childCount} รายการอยู่ภายใต้หมวดหมู่นี้ กรุณาย้ายหรือลบหมวดหมู่ย่อยก่อน`,
      });
    }

    await query('DELETE FROM categories WHERE id=?', [id]);
    return { success: true, message: 'ลบหมวดหมู่เรียบร้อยแล้ว' };
  } catch (error: any) {
    if (error?.statusCode) throw error;

    if (error?.code === 'ER_ROW_IS_REFERENCED_2' || error?.errno === 1451) {
      throw createError({
        statusCode: 409,
        statusMessage: 'ยังลบหมวดหมู่นี้ไม่ได้ เพราะมีข้อมูลอื่นในระบบใช้งานอยู่ กรุณาย้ายสินค้า/หมวดหมู่ย่อยออกก่อน',
      });
    }

    throw createError({ statusCode: 500, statusMessage: 'ลบหมวดหมู่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
  }
});
