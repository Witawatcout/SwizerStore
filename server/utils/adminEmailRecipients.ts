import { query } from "~~/server/utils/db";

export interface AdminEmailRecipient {
  id: number;
  name: string;
  email: string;
  is_active: number;
  created_at: string | Date;
  updated_at: string | Date;
}

let adminEmailRecipientsSchemaReady = false;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseEnvAdminEmails() {
  const config = useRuntimeConfig();
  return String(config.adminEmail || "")
    .split(/[;,]/)
    .map(normalizeEmail)
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

export async function ensureAdminEmailRecipientsSchema() {
  if (adminEmailRecipientsSchemaReady) return;

  await query(`
    CREATE TABLE IF NOT EXISTS admin_email_recipients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL DEFAULT '',
      email VARCHAR(190) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_admin_email_recipients_email (email)
    )
  `);

  adminEmailRecipientsSchemaReady = true;
}

export async function seedAdminEmailRecipientsFromEnvIfEmpty() {
  await ensureAdminEmailRecipientsSchema();

  const rows = await query<{ total: number }>("SELECT COUNT(*) AS total FROM admin_email_recipients");
  if (Number(rows[0]?.total || 0) > 0) return;

  const envEmails = parseEnvAdminEmails();
  for (const email of envEmails) {
    await query(
      "INSERT IGNORE INTO admin_email_recipients (name, email, is_active) VALUES (?, ?, 1)",
      ["Admin", email]
    );
  }
}

export async function getAdminEmailRecipients() {
  await seedAdminEmailRecipientsFromEnvIfEmpty();

  return await query<AdminEmailRecipient>(
    "SELECT id, name, email, is_active, created_at, updated_at FROM admin_email_recipients ORDER BY is_active DESC, id ASC"
  );
}

export async function getActiveAdminEmailAddresses() {
  await seedAdminEmailRecipientsFromEnvIfEmpty();

  const rows = await query<{ email: string }>(
    "SELECT email FROM admin_email_recipients WHERE is_active = 1 ORDER BY id ASC"
  );
  const configuredEmails = rows.map((row) => normalizeEmail(row.email)).filter(Boolean);

  if (configuredEmails.length) {
    return [...new Set(configuredEmails)];
  }

  return [...new Set(parseEnvAdminEmails())];
}

export function assertValidAdminRecipientEmail(email: string) {
  const normalized = normalizeEmail(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw createError({ statusCode: 400, statusMessage: "รูปแบบอีเมลไม่ถูกต้อง" });
  }

  return normalized;
}
