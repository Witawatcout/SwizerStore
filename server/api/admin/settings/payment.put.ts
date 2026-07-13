import { DEFAULT_LINE_URL, updateStorefrontSettings } from "~~/server/utils/storefrontSettings";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ payment_enabled?: boolean; paymentEnabled?: boolean; line_url?: string; lineUrl?: string }>(event);
  const paymentEnabled = body.payment_enabled ?? body.paymentEnabled;
  const lineUrl = String(body.line_url ?? body.lineUrl ?? DEFAULT_LINE_URL).trim();

  if (typeof paymentEnabled !== "boolean") {
    throw createError({ statusCode: 400, statusMessage: "payment_enabled must be a boolean" });
  }

  try {
    const parsed = new URL(lineUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    throw createError({ statusCode: 400, statusMessage: "LINE URL is invalid" });
  }

  return updateStorefrontSettings({
    payment_enabled: paymentEnabled,
    line_url: lineUrl,
  });
});
