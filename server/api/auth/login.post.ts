import { query } from "~~/server/utils/db";
import bcrypt from "bcryptjs";
import { signJwt } from "~~/server/utils/jwt";
import { checkRateLimit, getRateLimitInfo } from "~~/server/utils/rateLimit";
import { ensureEmailVerificationSchema } from "~~/server/utils/emailVerification";
import { ensureAtLeastOneSuperAdmin } from "~~/server/utils/adminAccess";

export default defineEventHandler(async (event) => {
  // Rate limiting — ตรวจจำนวน attempt ต่อ IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  if (!checkRateLimit(ip)) {
    const info = getRateLimitInfo(ip);
    const retryAfterSeconds = Math.ceil(info.resetIn / 1000);
    setResponseHeader(event, "Retry-After", String(retryAfterSeconds));
    throw createError({
      statusCode: 429,
      statusMessage: `Too many login attempts. Please try again in ${retryAfterSeconds} seconds.`,
    });
  }

  const body = await readBody<{ username: string; password: string }>(event);

  if (!body.username || !body.password) {
    throw createError({ statusCode: 400, statusMessage: "Missing username/password" });
  }

  await ensureEmailVerificationSchema();
  await ensureAtLeastOneSuperAdmin();

  // ดึงเฉพาะ field ที่ต้องใช้ (ไม่ SELECT *)
  const users = await query<any>(
    "SELECT id, username, password, email, role, email_verified_at FROM users WHERE username = ? LIMIT 1",
    [body.username]
  );

  // ใช้ error message เดียวกันทั้ง user not found และ wrong password (ป้องกัน user enumeration)
  const genericError = "Invalid username or password";

  if (users.length === 0) {
    throw createError({ statusCode: 401, statusMessage: genericError });
  }

  const user = users[0];
  const match = await bcrypt.compare(body.password, user.password);

  if (!match) {
    throw createError({ statusCode: 401, statusMessage: genericError });
  }

  if (!user.email_verified_at) {
    throw createError({ statusCode: 403, statusMessage: "Email is not verified" });
  }

  const token = signJwt({ id: user.id, username: user.username, email: user.email, role: user.role });

  // ส่ง token กลับ client
  return {
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
      id: user.id,
      token,
    },
  };
});
