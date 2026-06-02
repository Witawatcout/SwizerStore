import bcrypt from "bcryptjs";
import { query } from "~~/server/utils/db";
import { signJwt } from "~~/server/utils/jwt";
import { checkRateLimit, getRateLimitInfo } from "~~/server/utils/rateLimit";

interface RegisterBody {
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
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const rateKey = `register:${ip}`;

  if (!checkRateLimit(rateKey)) {
    const info = getRateLimitInfo(rateKey);
    const retryAfterSeconds = Math.ceil(info.resetIn / 1000);
    setResponseHeader(event, "Retry-After", String(retryAfterSeconds));
    throw createError({
      statusCode: 429,
      statusMessage: `Too many register attempts. Please try again in ${retryAfterSeconds} seconds.`,
    });
  }

  const body = await readBody<RegisterBody>(event);
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

  const existing = await query<any>(
    "SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1",
    [username, email]
  );

  if (existing.length) {
    const conflict = existing[0].username === username ? "Username" : "Email";
    throw createError({ statusCode: 409, statusMessage: `${conflict} is already registered` });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await query<any>(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')",
    [username, email, hashedPassword]
  );
  const userId = (result as any).insertId;
  const token = signJwt({ id: userId, username, email, role: "user" });

  return {
    user: {
      id: userId,
      username,
      email,
      role: "user",
      token,
    },
  };
});
