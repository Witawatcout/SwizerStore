import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรหัสสินค้าที่ต้องการลบ' });
  }

  try {
    const orderItems = await query<{ total: number }>('SELECT COUNT(*) AS total FROM order_items WHERE product_id=?', [id]);
    const orderItemCount = Number(orderItems[0]?.total || 0);

    if (orderItemCount > 0) {
      await query('UPDATE products SET is_active = 0 WHERE id=?', [id]);
      return {
        success: true,
        deleted: false,
        deactivated: true,
        message: 'สินค้านี้เคยอยู่ในคำสั่งซื้อแล้ว จึงไม่สามารถลบถาวรได้ ระบบจะปิดการขายสินค้าแทน',
      };
    }

    await query('DELETE FROM products WHERE id=?', [id]);
    return {
      success: true,
      deleted: true,
      deactivated: false,
      message: 'ลบสินค้าเรียบร้อยแล้ว',
    };
  } catch (error: any) {
    if (error?.code === 'ER_ROW_IS_REFERENCED_2' || error?.errno === 1451) {
      await query('UPDATE products SET is_active = 0 WHERE id=?', [id]);
      return {
        success: true,
        deleted: false,
        deactivated: true,
        message: 'สินค้านี้มีข้อมูลอ้างอิงในระบบ จึงไม่สามารถลบถาวรได้ ระบบจะปิดการขายสินค้าแทน',
      };
    }

    throw createError({ statusCode: 500, statusMessage: 'ลบสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
  }
});
