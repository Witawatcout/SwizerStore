import { requireAuth } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";
import { isChargeFailed, isChargeSuccessful, retrieveCharge } from "~~/server/utils/omise";
import { markOrderPaymentFailed, markOrderPaymentSuccess } from "~~/server/utils/orders";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = decodeURIComponent(getRouterParam(event, "id") || "");

  const rows = await query<any>(
    `SELECT o.id, o.payment_method, o.payment_status, o.omise_charge_id, o.promptpay_qr_url, o.expires_at, c.user_id
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  const order = rows[0];
  const canView = auth.role === "admin" || Number(order.user_id) === Number(auth.id);
  if (!canView) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  if (order.payment_method !== "promptpay") {
    throw createError({ statusCode: 400, statusMessage: "Order is not a PromptPay payment" });
  }

  let qrCodeUrl = order.promptpay_qr_url;
  let chargeStatus = order.payment_status;
  let paymentStatus = order.payment_status;

  if (order.omise_charge_id) {
    const charge = await retrieveCharge(order.omise_charge_id);
    chargeStatus = charge?.status || chargeStatus;
    qrCodeUrl =
      qrCodeUrl ||
      charge?.source?.scannable_code?.image?.download_uri ||
      null;

    if (isChargeSuccessful(charge)) {
      await markOrderPaymentSuccess(order.id, order.omise_charge_id);
      chargeStatus = "successful";
      paymentStatus = "success";
    } else if (isChargeFailed(charge)) {
      await markOrderPaymentFailed(order.id, order.omise_charge_id);
      chargeStatus = "failed";
      paymentStatus = "failed";
    }

    if (qrCodeUrl && qrCodeUrl !== order.promptpay_qr_url) {
      await query("UPDATE orders SET promptpay_qr_url = ? WHERE id = ?", [qrCodeUrl, order.id]);
    }
  }

  return {
    orderId: order.id,
    paymentStatus,
    chargeStatus,
    qrCodeUrl,
    expires_at: order.expires_at,
  };
});
