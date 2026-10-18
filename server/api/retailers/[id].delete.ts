import { query } from '@@/server/utils/db';
import { ensureRetailersTable } from '~~/server/utils/retailers';

export default defineEventHandler(async (event) => {
  await ensureRetailersTable();
  await query('DELETE FROM retailers WHERE id=?', [Number(getRouterParam(event, 'id'))]);
  return { success: true };
});
