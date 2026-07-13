import { getStorefrontSettings } from "~~/server/utils/storefrontSettings";

export default defineEventHandler(async () => {
  return getStorefrontSettings();
});
