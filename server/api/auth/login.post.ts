import { query } from "~~/server/utils/db";
import bcrypt from "bcryptjs";
import { signJwt } from "~~/server/utils/jwt";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string; password: string }>(event);

  if (!body.username || !body.password) {
    throw createError({ statusCode: 400, statusMessage: "Missing username/password" });
  }

  const users = await query<any>(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [body.username]
  );

  if (users.length === 0) {
    throw createError({ statusCode: 401, statusMessage: "User not found" });
  }

  const user = users[0];
  const match = await bcrypt.compare(body.password, user.password);

  if (!match) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }

  const token = signJwt({ username: user.username,email: user.email, role: user.role });

  // ส่ง token กลับ client
  return {
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
      token
    }
  };
});
