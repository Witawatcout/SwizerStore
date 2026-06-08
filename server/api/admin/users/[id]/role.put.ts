import { ADMIN_ROLE, SUPER_ADMIN_ROLE, isAdminRole } from "~~/server/utils/adminAccess";
import { requireSuperAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  const auth = requireSuperAdmin(event);
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody<{ role?: string }>(event);
  const nextRole = body.role === SUPER_ADMIN_ROLE ? SUPER_ADMIN_ROLE : ADMIN_ROLE;

  if (!Number.isFinite(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user id" });
  }

  const users = await query<{ id: number; role: string }>("SELECT id, role FROM users WHERE id = ? LIMIT 1", [id]);
  const user = users[0];

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  if (!isAdminRole(user.role)) {
    throw createError({ statusCode: 400, statusMessage: "This user is not an admin account" });
  }

  if (Number(auth.id) === id && nextRole !== SUPER_ADMIN_ROLE) {
    throw createError({ statusCode: 400, statusMessage: "You cannot reduce your own super admin permission" });
  }

  if (user.role === SUPER_ADMIN_ROLE && nextRole !== SUPER_ADMIN_ROLE) {
    const rows = await query<{ total: number }>("SELECT COUNT(*) AS total FROM users WHERE role = ?", [SUPER_ADMIN_ROLE]);
    if (Number(rows[0]?.total || 0) <= 1) {
      throw createError({ statusCode: 400, statusMessage: "At least one super admin is required" });
    }
  }

  await query("UPDATE users SET role = ? WHERE id = ?", [nextRole, id]);

  return { ok: true, user: { id, role: nextRole } };
});
