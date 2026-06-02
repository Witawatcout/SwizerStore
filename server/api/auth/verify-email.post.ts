import { query } from "~~/server/utils/db";
import { ensureEmailVerificationSchema, hashEmailVerificationToken } from "~~/server/utils/emailVerification";

interface VerifyEmailBody {
  token?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<VerifyEmailBody>(event);
  const token = String(body.token || "").trim();

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: "Verification token is required" });
  }

  await ensureEmailVerificationSchema();

  const tokenHash = hashEmailVerificationToken(token);
  const rows = await query<{ id: number; user_id: number }>(
    `SELECT id, user_id
     FROM email_verification_tokens
     WHERE token_hash = ?
       AND used_at IS NULL
       AND expires_at > UTC_TIMESTAMP()
     LIMIT 1`,
    [tokenHash]
  );

  const verificationToken = rows[0];
  if (!verificationToken) {
    throw createError({ statusCode: 400, statusMessage: "Verification link is invalid or expired" });
  }

  await query("UPDATE users SET email_verified_at = UTC_TIMESTAMP() WHERE id = ?", [verificationToken.user_id]);
  await query("UPDATE email_verification_tokens SET used_at = UTC_TIMESTAMP() WHERE id = ?", [verificationToken.id]);
  await query("UPDATE email_verification_tokens SET used_at = UTC_TIMESTAMP() WHERE user_id = ? AND used_at IS NULL", [
    verificationToken.user_id,
  ]);

  return { ok: true };
});
