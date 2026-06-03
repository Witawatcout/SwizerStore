import { checkRateLimit, getRateLimitInfo } from "~~/server/utils/rateLimit";
import { sendContactEmails } from "~~/server/utils/contactEmails";

interface ContactBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function requireText(value: unknown, field: string, maxLength: number) {
  const text = cleanText(value, maxLength);
  if (!text) {
    throw createError({ statusCode: 400, statusMessage: `${field} is required` });
  }
  return text;
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const rateKey = `contact:${ip}`;

  if (!checkRateLimit(rateKey)) {
    const info = getRateLimitInfo(rateKey);
    const retryAfterSeconds = Math.ceil(info.resetIn / 1000);
    setResponseHeader(event, "Retry-After", String(retryAfterSeconds));
    throw createError({
      statusCode: 429,
      statusMessage: `ส่งข้อความบ่อยเกินไป กรุณาลองใหม่อีกครั้งใน ${retryAfterSeconds} วินาที`,
    });
  }

  const body = await readBody<ContactBody>(event);
  const name = requireText(body.name, "name", 120);
  const email = requireText(body.email, "email", 160).toLowerCase();
  const subject = requireText(body.subject, "subject", 160);
  const message = requireText(body.message, "message", 3000);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid email address" });
  }

  if (message.length < 10) {
    throw createError({ statusCode: 400, statusMessage: "Message is too short" });
  }

  const result = await sendContactEmails({ name, email, subject, message, ip });

  if (!result.sent) {
    throw createError({
      statusCode: 500,
      statusMessage: result.reason || "Could not send contact email",
    });
  }

  return {
    ok: true,
    message: "ส่งข้อความเรียบร้อยแล้ว",
  };
});
