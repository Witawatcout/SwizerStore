import bcrypt from "bcryptjs";
import { requireAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";
import { ensureEmailVerificationSchema } from "~~/server/utils/emailVerification";

interface CreateAdminUserBody {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function requireText(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw createError({ statusCode: 400, statusMessage: `${field} is required` });
  }
  return value.trim();
}

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const body = await readBody<CreateAdminUserBody>(event);
  const username = requireText(body.username, "username");
  const email = requireText(body.email, "email").toLowerCase();
  const password = requireText(body.password, "password");
  const confirmPassword = requireText(body.confirmPassword, "confirmPassword");

  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username must be 3-50 characters and use letters, numbers, dots, underscores, or hyphens.",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid email address" });
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: "Password must be at least 8 characters" });
  }

  if (password !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: "Passwords do not match" });
  }

  await ensureEmailVerificationSchema();

  const existing = await query<any>(
    "SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1",
    [username, email]
  );

  if (existing.length) {
    const conflict = existing[0].username === username ? "Username" : "Email";
    throw createError({ statusCode: 409, statusMessage: `${conflict} is already registered` });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = (await query<any>(
    "INSERT INTO users (username, email, password, role, email_verified_at) VALUES (?, ?, ?, 'admin', UTC_TIMESTAMP())",
    [username, email, hashedPassword]
  )) as any;

  return {
    ok: true,
    user: {
      id: result.insertId,
      username,
      email,
      role: "admin",
    },
  };
});
