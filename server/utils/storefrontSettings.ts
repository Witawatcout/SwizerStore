import { query } from "~~/server/utils/db";

export const DEFAULT_LINE_URL = "https://page.line.me/swizer_superfood?openQrModal=true";

export interface StorefrontSettings {
  payment_enabled: boolean;
  line_url: string;
}

const SETTING_KEYS = {
  paymentEnabled: "payment_enabled",
  lineUrl: "line_url",
} as const;

async function ensureStorefrontSettingsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(
    `INSERT INTO app_settings (setting_key, setting_value)
     VALUES (?, ?), (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = setting_value`,
    [SETTING_KEYS.paymentEnabled, "1", SETTING_KEYS.lineUrl, DEFAULT_LINE_URL],
  );
}

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  await ensureStorefrontSettingsTable();

  const rows = await query<{ setting_key: string; setting_value: string }>(
    "SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN (?, ?)",
    [SETTING_KEYS.paymentEnabled, SETTING_KEYS.lineUrl],
  );

  const values = Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value]));

  return {
    payment_enabled: !["0", "false", "off"].includes(String(values[SETTING_KEYS.paymentEnabled] || "").toLowerCase()),
    line_url: values[SETTING_KEYS.lineUrl] || DEFAULT_LINE_URL,
  };
}

export async function updateStorefrontSettings(settings: Partial<StorefrontSettings>) {
  await ensureStorefrontSettingsTable();

  if (typeof settings.payment_enabled === "boolean") {
    await query(
      "UPDATE app_settings SET setting_value = ? WHERE setting_key = ?",
      [settings.payment_enabled ? "1" : "0", SETTING_KEYS.paymentEnabled],
    );
  }

  if (typeof settings.line_url === "string") {
    await query(
      "UPDATE app_settings SET setting_value = ? WHERE setting_key = ?",
      [settings.line_url, SETTING_KEYS.lineUrl],
    );
  }

  return getStorefrontSettings();
}
