import { requireAdmin } from "~~/server/utils/auth";
import {
  assertValidAdminRecipientEmail,
  ensureAdminEmailRecipientsSchema,
} from "~~/server/utils/adminEmailRecipients";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  await ensureAdminEmailRecipientsSchema();

  const body = await readBody<{ name?: string; email?: string; is_active?: boolean }>(event);
  const email = assertValidAdminRecipientEmail(String(body.email || ""));
  const name = String(body.name || "").trim().slice(0, 120);
  const isActive = body.is_active === false ? 0 : 1;

  try {
    await query(
      "INSERT INTO admin_email_recipients (name, email, is_active) VALUES (?, ?, ?)",
      [name, email, isActive]
    );
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
      throw createError({ statusCode: 409, statusMessage: "อีเมลนี้อยู่ในรายชื่อผู้รับแล้ว" });
    }
    throw error;
  }

  return { ok: true };
});
