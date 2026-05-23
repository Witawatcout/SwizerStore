import { query } from '@@/server/utils/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');
  
  try {
    // ดึงข้อมูลสินค้าเพื่อดูรูปภาพก่อนที่จะลบ
    const oldProducts = await query('SELECT image, gallery FROM products WHERE id=?', [id]) as any[];
    const oldProduct = oldProducts[0];

    if (oldProduct) {
      const oldImage = oldProduct.image || '';
      const oldGallery = typeof oldProduct.gallery === 'string' ? JSON.parse(oldProduct.gallery) : (oldProduct.gallery || []);

      const filesToDelete: string[] = [];

      // ถ้ารูปหลักอยู่ใน uploads
      if (oldImage && oldImage.startsWith('/uploads/')) {
        filesToDelete.push(oldImage);
      }

      // รูปใน gallery ทั้งหมดที่อยู่ใน uploads
      for (const oldGalUrl of oldGallery) {
        if (oldGalUrl.startsWith('/uploads/')) {
          filesToDelete.push(oldGalUrl);
        }
      }

      // ลบไฟล์ทางกายภาพ
      for (const url of filesToDelete) {
        const filename = url.split('/').pop();
        if (filename) {
          const filePath = join(process.cwd(), 'uploads', filename);
          await unlink(filePath).catch(() => {}); // เพิกเฉย error หากไฟล์ไม่อยู่แล้ว
        }
      }
    }

    // ลบข้อมูลจากฐานข้อมูล
    await query('DELETE FROM products WHERE id=?', [id]);
    return { success: true, message: 'Product deleted successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
