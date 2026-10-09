import { query } from '@@/server/utils/db';
import { ensureRetailersTable, parseRetailerBody } from '~~/server/utils/retailers';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const r = parseRetailerBody(await readBody(event));
  await ensureRetailersTable();

  await query(
    'UPDATE retailers SET name=?, image=?, link=?, sort_order=?, is_active=? WHERE id=?',
    [r.name, r.image, r.link, r.sort_order, r.is_active, id]
  );
  return { success: true };
});
