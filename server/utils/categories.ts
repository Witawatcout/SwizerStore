import { query } from "~~/server/utils/db";

export const DEFAULT_CATEGORY_COLOR = '#65A30D';

let categorySchemaReady = false;

export function normalizeCategoryColor(value: unknown) {
  const color = String(value || '').trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(color) ? color : DEFAULT_CATEGORY_COLOR;
}

export async function ensureCategoryStatusSchema() {
  if (categorySchemaReady) return;

  await query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER parent_id");
  await query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS color VARCHAR(7) NULL AFTER is_active");
  await query(`
    UPDATE categories
    SET color = CASE
      WHEN TRIM(id) = 'coffee' THEN '#8B5A2B'
      WHEN TRIM(id) = 'grains' THEN '#CA8A04'
      WHEN TRIM(id) = 'food-supplement' THEN '#16A34A'
      WHEN TRIM(id) = 'whey-protein' THEN '#2563EB'
      ELSE '${DEFAULT_CATEGORY_COLOR}'
    END
    WHERE color IS NULL OR color = ''
  `);
  await query(`ALTER TABLE categories MODIFY color VARCHAR(7) NOT NULL DEFAULT '${DEFAULT_CATEGORY_COLOR}'`);
  categorySchemaReady = true;
}
