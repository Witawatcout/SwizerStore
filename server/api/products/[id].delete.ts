import { query } from '@@/server/utils/db';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';

function parseGallery(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

async function deleteUploadedProductFiles(urls: string[]) {
  const uploadedUrls = [...new Set(urls.filter((url) => url.startsWith('/uploads/')))];
  let deletedFiles = 0;
  let failedFiles = 0;

  for (const url of uploadedUrls) {
    const filename = basename(url);
    if (!filename) continue;

    const filePath = join(process.cwd(), 'uploads', filename);
    try {
      await unlink(filePath);
      deletedFiles += 1;
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        failedFiles += 1;
        console.error('[DELETE /api/products] Failed to delete uploaded file:', filePath, error);
      }
    }
  }

  return { deletedFiles, failedFiles, totalFiles: uploadedUrls.length };
}

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรหัสสินค้าที่ต้องการลบ' });
  }

  try {
    const products = await query<{ image?: string | null; gallery?: string | string[] | null }>(
      'SELECT image, gallery FROM products WHERE id=? LIMIT 1',
      [id]
    );
    const product = products[0];

    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' });
    }

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
    const fileCleanup = await deleteUploadedProductFiles([
      product.image || '',
      ...parseGallery(product.gallery),
    ]);

    return {
      success: true,
      deleted: true,
      deactivated: false,
      ...fileCleanup,
      fileCleanupFailed: fileCleanup.failedFiles > 0,
      message: fileCleanup.failedFiles > 0
        ? 'ลบสินค้าแล้ว แต่มีไฟล์รูปภาพบางไฟล์ที่ hosting ไม่อนุญาตให้ลบ กรุณาตรวจสอบสิทธิ์โฟลเดอร์ uploads'
        : 'ลบสินค้าและไฟล์รูปภาพเรียบร้อยแล้ว',
    };
  } catch (error: any) {
    if (error?.statusCode) throw error;

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
