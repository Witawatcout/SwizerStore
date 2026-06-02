import crypto from "node:crypto";
import { query } from "~~/server/utils/db";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MINUTES = 30;

export function createResetToken() {
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString("base64url");
  return {
    token,
    tokenHash: hashResetToken(token),
  };
}

export function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function resetTokenExpiry() {
  return new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}

export async function ensurePasswordResetTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_password_reset_tokens_token_hash (token_hash),
      KEY idx_password_reset_tokens_user_id (user_id),
      KEY idx_password_reset_tokens_expires_at (expires_at),
      CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

export function formatMysqlDate(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
