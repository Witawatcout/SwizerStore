import { query } from "~~/server/utils/db";

export const ADMIN_ROLE = "admin";
export const SUPER_ADMIN_ROLE = "super_admin";

export function isAdminRole(role?: string | null) {
  return role === ADMIN_ROLE || role === SUPER_ADMIN_ROLE;
}

export function isSuperAdminRole(role?: string | null) {
  return role === SUPER_ADMIN_ROLE;
}

export async function ensureAtLeastOneSuperAdmin() {
  const superRows = await query<{ total: number }>("SELECT COUNT(*) AS total FROM users WHERE role = ?", [SUPER_ADMIN_ROLE]);
  if (Number(superRows[0]?.total || 0) > 0) return;

  const admins = await query<{ id: number }>("SELECT id FROM users WHERE role = ? ORDER BY id ASC LIMIT 1", [ADMIN_ROLE]);
  const firstAdmin = admins[0];
  if (!firstAdmin) return;

  await query("UPDATE users SET role = ? WHERE id = ?", [SUPER_ADMIN_ROLE, firstAdmin.id]);
}
