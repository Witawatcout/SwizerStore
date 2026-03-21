import { verifyJwt } from "~~/server/utils/jwt";

export default defineEventHandler(async (event) => {
  const token = getHeader(event, "authorization")?.replace("Bearer ", "");
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "No token" });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" });
  }

  return { user: payload };
});
