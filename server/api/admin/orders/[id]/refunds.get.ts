import { requireSuperAdmin } from "~~/server/utils/auth";
import { ensureOrderRefundSchema, getOrderRefunds } from "~~/server/utils/orderRefunds";

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event);
  await ensureOrderRefundSchema();

  const id = decodeURIComponent(getRouterParam(event, "id") || "");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Order ID is required" });
  }

  return { items: await getOrderRefunds(id) };
});
