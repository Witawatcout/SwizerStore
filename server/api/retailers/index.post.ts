import { query } from '@@/server/utils/db';
import { ensureRetailersTable, parseRetailerBody } from '~~/server/utils/retailers';

export default defineEventHandler(async (event) => {
  const r = parseRetailerBody(await readBody(event));
  await ensureRetailersTable();

  await query(
    'INSERT INTO retailers (name, image, link, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
    [r.name, r.image, r.link, r.sort_order, r.is_active]
  );
  return { success: true };
});
