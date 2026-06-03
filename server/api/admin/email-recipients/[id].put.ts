import { requireAdmin } from "~~/server/utils/auth";
import {
  assertValidAdminRecipientEmail,
  ensureAdminEmailRecipientsSchema,
} from "~~/server/utils/adminEmailRecipients";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  await ensureAdminEmailRecipientsSchema();

  const id = Number(getRouterParam(event, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid recipient id" });
  }

  const body = await readBody<{ name?: string; email?: string; is_active?: boolean }>(event);
  const email = assertValidAdminRecipientEmail(String(body.email || ""));
  const name = String(body.name || "").trim().slice(0, 120);
  const isActive = body.is_active === false ? 0 : 1;

  try {
    const result = (await query<any>(
      "UPDATE admin_email_recipients SET name = ?, email = ?, is_active = ? WHERE id = ?",
      [name, email, isActive, id]
    )) as any;

    if (!Number(result?.affectedRows || 0)) {
      throw createError({ statusCode: 404, statusMessage: "ไม่พบผู้รับอีเมลนี้" });
    }
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
      throw createError({ statusCode: 409, statusMessage: "อีเมลนี้อยู่ในรายชื่อผู้รับแล้ว" });
    }
    throw error;
  }

  return { ok: true };
});
