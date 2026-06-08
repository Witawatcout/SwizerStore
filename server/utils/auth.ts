import { verifyJwt } from "~~/server/utils/jwt";
import { isAdminRole, isSuperAdminRole } from "~~/server/utils/adminAccess";

export interface AuthPayload {
  id?: number;
  username: string;
  email?: string | null;
  role: "user" | "admin" | "super_admin" | string;
}

export function getBearerToken(event: any) {
  return getHeader(event, "authorization")?.replace("Bearer ", "") || "";
}

export function getOptionalAuth(event: any): AuthPayload | null {
  const token = getBearerToken(event);
  if (!token) return null;

  const payload = verifyJwt(token) as AuthPayload | null;
  return payload || null;
}

export function requireAuth(event: any): AuthPayload {
  const payload = getOptionalAuth(event);
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  event.context.auth = payload;
  return payload;
}

export function requireAdmin(event: any): AuthPayload {
  const payload = requireAuth(event);
  if (!isAdminRole(payload.role)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden: Admin access required" });
  }
  return payload;
}

export function requireSuperAdmin(event: any): AuthPayload {
  const payload = requireAuth(event);
  if (!isSuperAdminRole(payload.role)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden: Super admin access required" });
  }
  return payload;
}
