// PUT /api/users/profile — แก้ไขโปรไฟล์ของตัวเอง (email, password)
import { query } from "~~/server/utils/db";
import bcrypt from "bcryptjs";

interface UpdateBody {
  email?: string;
  password?: string;
}

export default defineEventHandler(async (event) => {
  const auth = event.context.auth as { username: string };
  const body = await readBody<UpdateBody>(event);

  const updates: string[] = [];
  const params: any[] = [];

  if (body.email !== undefined) {
    updates.push("email = ?");
    params.push(body.email);
  }

  if (body.password) {
    const hashed = await bcrypt.hash(body.password, 12);
    updates.push("password = ?");
    params.push(hashed);
  }

  if (updates.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No fields to update" });
  }

  params.push(auth.username);
  await query(`UPDATE users SET ${updates.join(", ")} WHERE username = ?`, params);

  return { success: true, message: "Profile updated" };
});
