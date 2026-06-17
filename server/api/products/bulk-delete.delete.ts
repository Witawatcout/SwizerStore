import { deleteProductById } from '~~/server/utils/productDeletion';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const ids = Array.isArray(body.ids)
    ? [...new Set(body.ids.map((id: unknown) => String(id || '').trim()).filter(Boolean))]
    : [];

  if (!ids.length) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ' });
  }

  if (ids.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'ลบสินค้าได้สูงสุดครั้งละ 200 รายการ' });
  }

  let deleted = 0;
  let deactivated = 0;
  let notFound = 0;
  let failed = 0;
  let failedFiles = 0;

  for (const id of ids) {
    try {
      const result = await deleteProductById(id);
      if (result.deleted) deleted += 1;
      if (result.deactivated) deactivated += 1;
      failedFiles += Number(result.failedFiles || 0);
    } catch (error: any) {
      if (error?.statusCode === 404) notFound += 1;
      else failed += 1;
    }
  }

  return {
    success: failed === 0,
    total: ids.length,
    deleted,
    deactivated,
    notFound,
    failed,
    failedFiles,
    fileCleanupFailed: failedFiles > 0,
  };
});
