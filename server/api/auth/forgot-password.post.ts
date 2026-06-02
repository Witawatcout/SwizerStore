import { query } from "~~/server/utils/db";
import { checkRateLimit, getRateLimitInfo } from "~~/server/utils/rateLimit";
import {
  createResetToken,
  ensurePasswordResetTable,
  formatMysqlDate,
  resetTokenExpiry,
} from "~~/server/utils/passwordReset";
import { sendPasswordResetEmail } from "~~/server/utils/passwordResetEmails";

interface ForgotPasswordBody {
  email?: string;
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const rateKey = `forgot-password:${ip}`;

  if (!checkRateLimit(rateKey)) {
    const info = getRateLimitInfo(rateKey);
    const retryAfterSeconds = Math.ceil(info.resetIn / 1000);
    setResponseHeader(event, "Retry-After", String(retryAfterSeconds));
    throw createError({
      statusCode: 429,
      statusMessage: `Too many password reset attempts. Please try again in ${retryAfterSeconds} seconds.`,
    });
  }

  const body = await readBody<ForgotPasswordBody>(event);
  const email = String(body.email || "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid email address" });
  }

  await ensurePasswordResetTable();

  const users = await query<{ id: number; username: string; email: string }>(
    "SELECT id, username, email FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  const user = users[0];
  if (user) {
    const { token, tokenHash } = createResetToken();
    const expiresAt = resetTokenExpiry();

    await query("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL", [
      user.id,
    ]);
    await query("INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)", [
      user.id,
      tokenHash,
      formatMysqlDate(expiresAt),
    ]);

    await sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      token,
    });
  }

  return {
    ok: true,
    message: "If this email exists in our system, password reset instructions have been sent.",
  };
});
