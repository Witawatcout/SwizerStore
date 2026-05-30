import { requireAdmin } from "~~/server/utils/auth";
import { query } from "~~/server/utils/db";
import { isChargeFailed, isChargeSuccessful, retrieveCharge } from "~~/server/utils/omise";
import { markOrderPaymentFailed, markOrderPaymentSuccess } from "~~/server/utils/orders";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const id = decodeURIComponent(getRouterParam(event, "id") || "");
  const rows = await query<any>(
    "SELECT id, payment_status, omise_charge_id FROM orders WHERE id = ? LIMIT 1",
    [id]
  );

  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  const order = rows[0];
  if (!order.omise_charge_id) {
    throw createError({ statusCode: 400, statusMessage: "Order has no Omise charge id" });
  }

  const charge = await retrieveCharge(order.omise_charge_id);

  if (isChargeSuccessful(charge)) {
    await markOrderPaymentSuccess(id, charge.id);
    return { success: true, paymentStatus: "success", chargeStatus: charge.status };
  }

  if (isChargeFailed(charge)) {
    await markOrderPaymentFailed(id, charge.id);
    return { success: true, paymentStatus: "failed", chargeStatus: charge.status };
  }

  return { success: true, paymentStatus: order.payment_status, chargeStatus: charge.status };
});
