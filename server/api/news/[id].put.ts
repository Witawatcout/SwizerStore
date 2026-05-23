import { query } from '@@/server/utils/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '');
  const body = await readBody(event);
  
  try {
    // ดึงข้อมูลข่าวเดิมเพื่อเปรียบเทียบรูปภาพ
    const oldRows = await query('SELECT image FROM news WHERE id=?', [id]) as any[];
    const oldNews = oldRows[0];

    if (oldNews) {
      const newImage = body.image || '';
      const oldImage = oldNews.image || '';

      // ถ้ารูปหลักถูกเปลี่ยนหรือถูกลบ
      if (oldImage && oldImage !== newImage && oldImage.startsWith('/uploads/')) {
        const filename = oldImage.split('/').pop();
        if (filename) {
          const filePath = join(process.cwd(), 'uploads', filename);
          await unlink(filePath).catch(() => {});
        }
      }
    }

    await query(
      'UPDATE news SET tag=?, date=?, title=?, `desc`=?, image=?, content=? WHERE id=?',
      [body.tag, body.date, body.title, body.desc, body.image, body.content, id]
    );
    return { success: true, message: 'News updated successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
