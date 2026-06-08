import { query } from "~~/server/utils/db";

let orderTrackingSchemaReady = false;

export async function ensureOrderTrackingSchema() {
  if (orderTrackingSchemaReady) return;

  await query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(120) DEFAULT NULL AFTER status");

  orderTrackingSchemaReady = true;
}

export function cleanTrackingNumber(value: unknown) {
  if (typeof value !== "string") return null;
  const trackingNumber = value.trim();
  return trackingNumber ? trackingNumber.slice(0, 120) : null;
}
