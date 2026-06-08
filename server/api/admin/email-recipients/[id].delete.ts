import { requireSuperAdmin } from "~~/server/utils/auth";
import { ensureAdminEmailRecipientsSchema } from "~~/server/utils/adminEmailRecipients";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event);
  await ensureAdminEmailRecipientsSchema();

  const id = Number(getRouterParam(event, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid recipient id" });
  }

  const result = (await query<any>("DELETE FROM admin_email_recipients WHERE id = ?", [id])) as any;
  if (!Number(result?.affectedRows || 0)) {
    throw createError({ statusCode: 404, statusMessage: "ไม่พบผู้รับอีเมลนี้" });
  }

  return { ok: true };
});
