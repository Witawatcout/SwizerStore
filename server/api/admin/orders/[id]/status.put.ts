import { requireSuperAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";
import { cleanTrackingNumber, ensureOrderTrackingSchema } from "~~/server/utils/orderTracking";

const allowedStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event);
  await ensureOrderTrackingSchema();

  const id = decodeURIComponent(getRouterParam(event, "id") || "");
  const body = await readBody<{ status: string; tracking_number?: string; trackingNumber?: string }>(event);

  if (!allowedStatuses.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid order status" });
  }

  const hasTrackingNumber = Object.prototype.hasOwnProperty.call(body, "tracking_number") || Object.prototype.hasOwnProperty.call(body, "trackingNumber");
  const trackingNumber = cleanTrackingNumber(body.tracking_number ?? body.trackingNumber);

  if (hasTrackingNumber) {
    await query("UPDATE orders SET status = ?, tracking_number = ? WHERE id = ?", [body.status, trackingNumber, id]);
  } else {
    await query("UPDATE orders SET status = ? WHERE id = ?", [body.status, id]);
  }

  return { success: true, tracking_number: hasTrackingNumber ? trackingNumber : undefined };
});
