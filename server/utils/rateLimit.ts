// Simple in-memory rate limiter สำหรับ login API
// ป้องกัน brute force attack

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Config
const MAX_ATTEMPTS = 5; // จำนวนครั้งสูงสุดที่อนุญาต
const WINDOW_MS = 15 * 60 * 1000; // 15 นาที

/**
 * ตรวจสอบ rate limit สำหรับ IP ที่กำหนด
 * @returns true ถ้ายังไม่เกิน limit, false ถ้าเกินแล้ว
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // ถ้ายังไม่มี entry หรือ หมดเวลา window แล้ว → reset
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  // นับ attempt
  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    return false; // เกิน limit
  }

  return true;
}

/**
 * ดึงข้อมูล rate limit สำหรับแสดงใน response header (optional)
 */
export function getRateLimitInfo(ip: string) {
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    return { remaining: MAX_ATTEMPTS, resetIn: 0 };
  }
  const remaining = Math.max(0, MAX_ATTEMPTS - entry.count);
  const resetIn = Math.max(0, entry.resetTime - Date.now());
  return { remaining, resetIn };
}

// ลบ entry ที่หมดอายุเป็นระยะ (ป้องกัน memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 1000); // ทุก 1 นาที
