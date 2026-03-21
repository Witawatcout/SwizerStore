// GET /api/admin/users — ดึงรายชื่อ user ทั้งหมด (เฉพาะ admin)
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  // auth ถูกตรวจแล้วจาก server middleware (event.context.auth)
  const users = await query<any>(
    "SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY id ASC"
  );

  return { users };
});
