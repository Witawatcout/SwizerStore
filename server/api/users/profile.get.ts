// GET /api/users/profile — ดึงข้อมูลโปรไฟล์ของตัวเอง
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  const auth = event.context.auth as { username: string };

  const users = await query<any>(
    "SELECT id, username, email, role, created_at, updated_at FROM users WHERE username = ? LIMIT 1",
    [auth.username]
  );

  if (users.length === 0) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return { user: users[0] };
});
