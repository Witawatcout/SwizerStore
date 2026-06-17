import { query } from '@@/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const ids = Array.isArray(body.ids)
    ? [...new Set(body.ids.map((id: unknown) => String(id || '').trim()).filter(Boolean))]
    : [];
  const isActive = body.is_active === true || body.is_active === 1 ? 1 : 0;

  if (!ids.length) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ' });
  }

  if (ids.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'อัปเดตสินค้าได้สูงสุดครั้งละ 200 รายการ' });
  }

  try {
    const placeholders = ids.map(() => '?').join(', ');
    await query(
      `UPDATE products SET is_active = ? WHERE id IN (${placeholders})`,
      [isActive, ...ids]
    );

    return {
      success: true,
      updated: ids.length,
      is_active: isActive,
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
