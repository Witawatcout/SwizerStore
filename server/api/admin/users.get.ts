// GET /api/admin/users — ดึงรายชื่อ user ทั้งหมด (เฉพาะ super admin)
import { requireSuperAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event);

  const users = await query<any>(
    "SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY id ASC"
  );

  return { users };
});
