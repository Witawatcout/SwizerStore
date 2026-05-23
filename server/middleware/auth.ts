import { verifyJwt } from "~~/server/utils/jwt";

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  // /api/auth/* → public (login, logout, me)
  if (!path.startsWith("/api/") || path.startsWith("/api/auth/")) return;

  // GET /api/products, /api/categories → public (หน้าเว็บสาธารณะต้องดึงข้อมูลได้)
  const method = getMethod(event);
  if (method === "GET" && (path.startsWith("/api/products") || path.startsWith("/api/categories"))) return;

  // ตรวจ token สำหรับ API ที่ต้อง login
  const token = getHeader(event, "authorization")?.replace("Bearer ", "");
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized: No token provided" });
  }

  const payload = verifyJwt(token) as { username: string; role: string } | null;
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized: Invalid token" });
  }

  // /api/admin/* → เฉพาะ admin เท่านั้น
  if (path.startsWith("/api/admin") && payload.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden: Admin access required" });
  }

  // admin ใช้ได้ทุก API → ไม่ต้องเช็กเพิ่ม
  // user ใช้ได้เฉพาะ /api/users/* (ถ้ามี API อื่นนอก admin/users ก็ใช้ได้)

  // แนบ auth payload ไว้ใน event context
  event.context.auth = payload;
});
