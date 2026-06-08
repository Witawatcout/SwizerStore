import { requireSuperAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event);

  await query(
    `UPDATE orders
     SET admin_seen_at = CURRENT_TIMESTAMP
     WHERE payment_status = 'success'
       AND admin_seen_at IS NULL`
  );

  return { success: true };
});
