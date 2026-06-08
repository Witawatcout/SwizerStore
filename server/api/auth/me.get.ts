import { signJwt, verifyJwt } from "~~/server/utils/jwt";
import { query } from "~~/server/utils/db";
import { ensureAtLeastOneSuperAdmin } from "~~/server/utils/adminAccess";

export default defineEventHandler(async (event) => {
  const token = getHeader(event, "authorization")?.replace("Bearer ", "");
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "No token" });
  }

  const payload = verifyJwt(token) as { username: string } | null;
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" });
  }

  await ensureAtLeastOneSuperAdmin();

  // ตรวจสอบว่า user ยังอยู่ใน DB จริง (กรณีถูกลบ/ban แล้ว token ยังไม่หมดอายุ)
  const users = await query<any>(
    "SELECT id, username, email, role FROM users WHERE username = ? LIMIT 1",
    [payload.username]
  );

  if (users.length === 0) {
    throw createError({ statusCode: 401, statusMessage: "User no longer exists" });
  }

  const user = users[0];
  const freshToken = signJwt({ id: user.id, username: user.username, email: user.email, role: user.role });

  return { user, token: freshToken };
});
