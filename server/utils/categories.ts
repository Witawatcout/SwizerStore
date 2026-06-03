import { query } from "~~/server/utils/db";

let categoryStatusSchemaReady = false;

export async function ensureCategoryStatusSchema() {
  if (categoryStatusSchemaReady) return;

  await query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER parent_id");
  categoryStatusSchemaReady = true;
}
