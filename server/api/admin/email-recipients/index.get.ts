import { requireAdmin } from "~~/server/utils/auth";
import { getAdminEmailRecipients } from "~~/server/utils/adminEmailRecipients";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  return await getAdminEmailRecipients();
});
