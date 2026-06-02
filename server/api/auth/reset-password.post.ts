import bcrypt from "bcryptjs";
import { query } from "~~/server/utils/db";
import { checkRateLimit, getRateLimitInfo } from "~~/server/utils/rateLimit";
import { ensurePasswordResetTable, hashResetToken } from "~~/server/utils/passwordReset";

interface ResetPasswordBody {
  token?: string;
  password?: string;
  confirmPassword?: string;
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const rateKey = `reset-password:${ip}`;

  if (!checkRateLimit(rateKey)) {
    const info = getRateLimitInfo(rateKey);
    const retryAfterSeconds = Math.ceil(info.resetIn / 1000);
    setResponseHeader(event, "Retry-After", String(retryAfterSeconds));
    throw createError({
      statusCode: 429,
      statusMessage: `Too many password reset attempts. Please try again in ${retryAfterSeconds} seconds.`,
    });
  }

  const body = await readBody<ResetPasswordBody>(event);
  const token = String(body.token || "").trim();
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: "Reset token is required" });
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: "Password must be at least 8 characters" });
  }
  if (password !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: "Passwords do not match" });
  }

  await ensurePasswordResetTable();

  const tokenHash = hashResetToken(token);
  const rows = await query<{ id: number; user_id: number }>(
    `SELECT id, user_id
     FROM password_reset_tokens
     WHERE token_hash = ?
       AND used_at IS NULL
       AND expires_at > UTC_TIMESTAMP()
     LIMIT 1`,
    [tokenHash]
  );

  const resetToken = rows[0];
  if (!resetToken) {
    throw createError({ statusCode: 400, statusMessage: "Reset link is invalid or expired" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, resetToken.user_id]);
  await query("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?", [resetToken.id]);
  await query("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL", [
    resetToken.user_id,
  ]);

  return { ok: true };
});
