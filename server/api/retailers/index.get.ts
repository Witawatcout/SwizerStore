import { query } from '@@/server/utils/db';
import { getOptionalAuth } from '~~/server/utils/auth';
import { isAdminRole } from '~~/server/utils/adminAccess';
import { ensureRetailersTable } from '~~/server/utils/retailers';

export default defineEventHandler(async (event) => {
  await ensureRetailersTable();

  const includeInactive = getQuery(event).includeInactive === '1' && isAdminRole(getOptionalAuth(event)?.role);
  return query(
    `SELECT * FROM retailers ${includeInactive ? '' : 'WHERE is_active = 1'} ORDER BY sort_order ASC, id ASC`
  );
});
