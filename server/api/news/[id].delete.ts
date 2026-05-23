import { query } from '@@/server/utils/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');
  
  try {
    // ดึงข้อมูลข่าวเพื่อดูรูปภาพก่อนลบ
    const oldRows = await query('SELECT image FROM news WHERE id=?', [id]) as any[];
    const oldNews = oldRows[0];

    if (oldNews) {
      const oldImage = oldNews.image || '';

      // ถ้ารูปอยู่ใน uploads → ลบไฟล์ทิ้ง
      if (oldImage && oldImage.startsWith('/uploads/')) {
        const filename = oldImage.split('/').pop();
        if (filename) {
          const filePath = join(process.cwd(), 'uploads', filename);
          await unlink(filePath).catch(() => {});
        }
      }
    }

    // ลบข้อมูลจากฐานข้อมูล
    await query('DELETE FROM news WHERE id=?', [id]);
    return { success: true, message: 'News deleted successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
