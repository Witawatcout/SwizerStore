import crypto from "node:crypto";
import { query } from "~~/server/utils/db";

const VERIFY_TOKEN_BYTES = 32;
const VERIFY_TOKEN_TTL_HOURS = 24;

export function createEmailVerificationToken() {
  const token = crypto.randomBytes(VERIFY_TOKEN_BYTES).toString("base64url");
  return {
    token,
    tokenHash: hashEmailVerificationToken(token),
  };
}

export function hashEmailVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function emailVerificationExpiry() {
  return new Date(Date.now() + VERIFY_TOKEN_TTL_HOURS * 60 * 60 * 1000);
}

export function formatEmailVerificationMysqlDate(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function ensureEmailVerificationSchema() {
  const columns = await query<{ column_count: number }>(
    `SELECT COUNT(*) AS column_count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME = 'email_verified_at'`
  );
  const hasVerifiedColumn = Number(columns[0]?.column_count || 0) > 0;

  if (!hasVerifiedColumn) {
    await query("ALTER TABLE users ADD COLUMN email_verified_at DATETIME DEFAULT NULL AFTER email");
    await query(
      "UPDATE users SET email_verified_at = COALESCE(updated_at, created_at, UTC_TIMESTAMP()) WHERE email_verified_at IS NULL"
    );
  }

  await query(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_email_verification_tokens_token_hash (token_hash),
      KEY idx_email_verification_tokens_user_id (user_id),
      KEY idx_email_verification_tokens_expires_at (expires_at),
      CONSTRAINT fk_email_verification_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}
