import { requireAdmin } from "~~/server/utils/auth";
import { sendOrderPaidEmails } from "~~/server/utils/orderEmails";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const id = decodeURIComponent(getRouterParam(event, "id") || "");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Order id is required" });
  }

  try {
    return await sendOrderPaidEmails(id, { force: true, purpose: "status_update" });
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || "Could not send order email",
    });
  }
});
