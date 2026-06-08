import { requireSuperAdmin } from "~~/server/utils/auth";
import { getAdminEmailRecipients } from "~~/server/utils/adminEmailRecipients";

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event);

  return await getAdminEmailRecipients();
});
