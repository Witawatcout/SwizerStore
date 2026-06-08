import { query } from '@@/server/utils/db';
import { getOptionalAuth } from '~~/server/utils/auth';
import { isAdminRole } from '~~/server/utils/adminAccess';
import { ensureCategoryStatusSchema } from '~~/server/utils/categories';

export default defineEventHandler(async (event) => {
  try {
    await ensureCategoryStatusSchema();

    const auth = getOptionalAuth(event);
    const includeInactive = getQuery(event).includeInactive === '1' && isAdminRole(auth?.role);
    const categories = await query(
      includeInactive
        ? `SELECT c.* FROM categories c ORDER BY c.name ASC`
        : `SELECT c.*
           FROM categories c
           LEFT JOIN categories parent ON c.parent_id = parent.id
           WHERE COALESCE(c.is_active, 1) = 1
             AND (c.parent_id IS NULL OR COALESCE(parent.is_active, 1) = 1)
           ORDER BY c.name ASC`
    );

    return categories;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
