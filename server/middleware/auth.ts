import { verifyJwt } from "~~/server/utils/jwt";
import { isAdminRole, isSuperAdminRole } from "~~/server/utils/adminAccess";

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  const method = getMethod(event);

  if (!path.startsWith("/api/") || path.startsWith("/api/auth/")) return;
  if (path === "/api/checkout" || path === "/api/contact" || path === "/api/webhook/omise") return;

  const isPublicRead =
    method === "GET" &&
    (path.startsWith("/api/products") ||
      path.startsWith("/api/categories") ||
      path.startsWith("/api/news") ||
      path.startsWith("/api/orders/"));

  if (isPublicRead) return;

  const token = getHeader(event, "authorization")?.replace("Bearer ", "");
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized: No token provided" });
  }

  const payload = verifyJwt(token) as { id?: number; username: string; role: string } | null;
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized: Invalid token" });
  }

  const isProductWrite = path.startsWith("/api/products") && method !== "GET";
  const isCatalogWrite =
    (path.startsWith("/api/categories") ||
      path.startsWith("/api/news") ||
      path.startsWith("/api/upload")) &&
    method !== "GET";
  const isSuperAdminOnly =
    path.startsWith("/api/admin/orders") ||
    path.startsWith("/api/admin/notifications") ||
    path.startsWith("/api/admin/users") ||
    path.startsWith("/api/admin/email-recipients");

  if (isSuperAdminOnly && !isSuperAdminRole(payload.role)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden: Super admin access required" });
  }

  if ((path.startsWith("/api/admin") || isProductWrite || isCatalogWrite) && !isAdminRole(payload.role)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden: Admin access required" });
  }

  event.context.auth = payload;
});
