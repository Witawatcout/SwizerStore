import { query } from '@@/server/utils/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');
  const body = await readBody(event);
  
  try {
    // ดึงข้อมูลสินค้าเดิมเพื่อเปรียบเทียบรูปภาพที่อาจถูกลบ
    const oldProducts = await query('SELECT image, gallery FROM products WHERE id=?', [id]) as any[];
    const oldProduct = oldProducts[0];

    if (oldProduct) {
      const newImage = body.image || '';
      const oldImage = oldProduct.image || '';
      const newGallery = body.gallery || [];
      const oldGallery = typeof oldProduct.gallery === 'string' ? JSON.parse(oldProduct.gallery) : (oldProduct.gallery || []);

      const filesToDelete: string[] = [];

      // ถ้ารูปหลักถูกเปลี่ยนหรือถูกลบ
      if (oldImage && oldImage !== newImage && oldImage.startsWith('/uploads/')) {
        filesToDelete.push(oldImage);
      }

      // ถ้ารูปใน gallery ถูกลบออกไป
      for (const oldGalUrl of oldGallery) {
        if (!newGallery.includes(oldGalUrl) && oldGalUrl.startsWith('/uploads/')) {
          filesToDelete.push(oldGalUrl);
        }
      }

      console.log('[PUT /api/products] Old Image:', oldImage, 'New Image:', newImage);
      console.log('[PUT /api/products] Old Gallery:', oldGallery, 'New Gallery:', newGallery);
      console.log('[PUT /api/products] Files to delete:', filesToDelete);

      // ลบไฟล์ทางกายภาพออกจากเซิร์ฟเวอร์
      for (const url of filesToDelete) {
        const filename = url.split('/').pop();
        if (filename) {
          const filePath = join(process.cwd(), 'uploads', filename);
          console.log('[PUT /api/products] Unlinking:', filePath);
          await unlink(filePath).catch((err) => {
            console.error('[PUT /api/products] Failed to delete file:', filePath, err);
          });
        }
      }
    }

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
