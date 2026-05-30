import { requireAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";

const allowedStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const id = decodeURIComponent(getRouterParam(event, "id") || "");
  const body = await readBody<{ status: string }>(event);

  if (!allowedStatuses.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid order status" });
  }

  await query("UPDATE orders SET status = ? WHERE id = ?", [body.status, id]);
  return { success: true };
});
