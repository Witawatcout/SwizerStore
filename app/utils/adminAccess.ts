export const ADMIN_ROLE = "admin";
export const SUPER_ADMIN_ROLE = "super_admin";

export function isAdminRole(role?: string | null) {
  return role === ADMIN_ROLE || role === SUPER_ADMIN_ROLE;
}

export function isSuperAdminRole(role?: string | null) {
  return role === SUPER_ADMIN_ROLE;
}

export function adminRoleLabel(role?: string | null) {
  if (role === SUPER_ADMIN_ROLE) return "Super Admin";
  if (role === ADMIN_ROLE) return "Admin";
  return role || "-";
}
