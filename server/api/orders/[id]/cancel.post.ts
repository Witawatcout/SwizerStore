import { requireAuth } from "~~/server/utils/auth";
import { getPool } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = decodeURIComponent(getRouterParam(event, "id") || "");

  if (!auth.id) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<any[]>(
      `SELECT o.id, o.status, o.payment_status, c.user_id
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ?
       LIMIT 1
       FOR UPDATE`,
      [id]
    );

    if (!rows.length) {
      throw createError({ statusCode: 404, statusMessage: "Order not found" });
    }

    const order = rows[0];
    const isOwner = Number(order.user_id) === Number(auth.id);
    const isAdmin = auth.role === "admin";

    if (!isOwner && !isAdmin) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }

    if (order.payment_status === "success") {
      throw createError({ statusCode: 400, statusMessage: "Paid orders cannot be cancelled here" });
    }

    if (order.status === "cancelled") {
      await conn.commit();
      return { success: true, orderId: id, status: "cancelled", payment_status: order.payment_status };
    }

    await conn.execute(
      `UPDATE orders
       SET status = 'cancelled', payment_status = 'failed'
       WHERE id = ? AND payment_status <> 'success'`,
      [id]
    );

    await conn.commit();

    return {
      success: true,
      orderId: id,
      status: "cancelled",
      payment_status: "failed",
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
});
