import { deleteProductById } from '~~/server/utils/productDeletion';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรหัสสินค้าที่ต้องการลบ' });
  }

  try {
    return { success: true, ...(await deleteProductById(id)) };
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'ลบสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
  }
});
