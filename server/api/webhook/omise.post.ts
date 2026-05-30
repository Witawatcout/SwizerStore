import { query } from "~~/server/utils/db";
import { markOrderPaymentFailed, markOrderPaymentSuccess } from "~~/server/utils/orders";
import { isChargeFailed, isChargeSuccessful, retrieveCharge } from "~~/server/utils/omise";
import crypto from "node:crypto";

function verifyOmiseSignature(input: {
  rawBody: string;
  signatureHeader?: string;
  timestampHeader?: string;
  secret?: string;
}) {
  if (!input.secret || !input.signatureHeader || !input.timestampHeader) return false;

  const signedPayload = `${input.timestampHeader}.${input.rawBody}`;
  const expected = crypto
    .createHmac("sha256", Buffer.from(input.secret, "base64"))
    .update(signedPayload)
    .digest();

  return input.signatureHeader.split(",").some((signature) => {
    const trimmed = signature.trim();
    const received = Buffer.from(trimmed, "hex");
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  });
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const expectedSecret = config.omiseWebhookSecret as string | undefined;
  const rawBody = await readRawBody(event, "utf8");

  const isValid = verifyOmiseSignature({
    rawBody: rawBody || "",
    signatureHeader: getHeader(event, "omise-signature"),
    timestampHeader: getHeader(event, "omise-signature-timestamp"),
    secret: expectedSecret,
  });

  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: "Invalid webhook secret" });
  }

  const body = rawBody ? JSON.parse(rawBody) : {};
  const eventKey = body.key || body.type;
  const charge = body.data || body.charge || {};
  const chargeId = charge.id;

  if (!chargeId || !["charge.complete", "charge.failed"].includes(eventKey)) {
    return { received: true, ignored: true };
  }

  const orders = await query<any>("SELECT id FROM orders WHERE omise_charge_id = ? LIMIT 1", [chargeId]);
  const orderId = orders[0]?.id;

  if (!orderId) {
    return { received: true, ignored: true };
  }

  const verifiedCharge = await retrieveCharge(chargeId);

  if (eventKey === "charge.failed" || isChargeFailed(verifiedCharge)) {
    await markOrderPaymentFailed(orderId, chargeId);
    return { received: true, orderId, paymentStatus: "failed" };
  }

  if (!isChargeSuccessful(verifiedCharge)) {
    return { received: true, orderId, paymentStatus: "pending" };
  }

  await markOrderPaymentSuccess(orderId, chargeId);
  return { received: true, orderId, paymentStatus: "success" };
});
