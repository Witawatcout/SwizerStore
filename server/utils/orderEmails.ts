import { query } from "~~/server/utils/db";
import { sendMail } from "~~/server/utils/email";
import { getActiveAdminEmailAddresses } from "~~/server/utils/adminEmailRecipients";
import { ensureOrderTrackingSchema } from "~~/server/utils/orderTracking";

interface OrderEmailRow {
  id: string;
  status: string;
  tracking_number?: string | null;
  payment_status: string;
  payment_method: string;
  subtotal: number | string;
  shipping_fee: number | string;
  total: number | string;
  note?: string | null;
  created_at: string | Date;
  confirmation_email_sent_at?: string | Date | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  address_line2?: string | null;
  subdistrict?: string | null;
  district: string;
  province: string;
  postal_code: string;
  delivery_note?: string | null;
}

interface OrderItemRow {
  product_name: string;
  unit_price: number | string;
  quantity: number;
  subtotal: number | string;
}

interface EmailCopy {
  audience: "customer" | "admin";
  heading: string;
  intro: string;
  eyebrow: string;
  ctaLabel: string;
  ctaUrl: string;
}

function money(value: number | string) {
  return `฿${Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function paymentMethodLabel(method: string) {
  return method === "promptpay" ? "พร้อมเพย์ (PromptPay)" : "บัตรเครดิต/เดบิต";
}

function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "รอชำระเงิน",
    success: "ชำระเงินแล้ว",
    failed: "ชำระเงินไม่สำเร็จ",
  };
  return labels[status] || status;
}

function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "รอดำเนินการ",
    paid: "ชำระเงินแล้ว",
    processing: "กำลังเตรียมสินค้า",
    shipped: "จัดส่งแล้ว",
    delivered: "ส่งสำเร็จแล้ว",
    cancelled: "ยกเลิกแล้ว",
  };
  return labels[status] || status;
}

function statusBadgeStyle(status: string) {
  if (status === "cancelled") {
    return "background:#fff1f2;color:#be123c;border:1px solid #fecdd3;";
  }
  if (status === "delivered") {
    return "background:#e8f7df;color:#31750b;border:1px solid #bde7a3;";
  }
  if (status === "shipped") {
    return "background:#eef4ff;color:#175cd3;border:1px solid #c7d7fe;";
  }
  if (status === "processing") {
    return "background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;";
  }
  return "background:#f5f9f0;color:#4f8f13;border:1px solid #dbe7cf;";
}

function shippingAddress(order: OrderEmailRow) {
  return [
    `${order.first_name} ${order.last_name}`,
    order.phone,
    order.address,
    order.address_line2,
    order.subdistrict,
    order.district,
    order.province,
    order.postal_code,
    order.delivery_note ? `หมายเหตุจัดส่ง: ${order.delivery_note}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPlainText(order: OrderEmailRow, items: OrderItemRow[], copy: EmailCopy) {
  const itemLines = items
    .map((item) => `- ${item.product_name} x ${item.quantity}: ${money(item.subtotal)}`)
    .join("\n");

  return [
    copy.heading,
    copy.intro,
    "",
    `เลขคำสั่งซื้อ: ${order.id}`,
    `วันที่สั่งซื้อ: ${formatDate(order.created_at)}`,
    `ช่องทางชำระเงิน: ${paymentMethodLabel(order.payment_method)}`,
    `สถานะการชำระเงิน: ${paymentStatusLabel(order.payment_status)}`,
    `สถานะคำสั่งซื้อ: ${orderStatusLabel(order.status)}`,
    order.tracking_number ? `เลขพัสดุ/เลขติดตาม: ${order.tracking_number}` : "",
    "",
    "รายการสินค้า",
    itemLines,
    "",
    `ยอดสินค้า: ${money(order.subtotal)}`,
    `ค่าจัดส่ง: ${Number(order.shipping_fee) > 0 ? money(order.shipping_fee) : "ฟรี"}`,
    `ยอดรวม: ${money(order.total)}`,
    "",
    "รายละเอียดจัดส่ง",
    shippingAddress(order),
    order.note ? `\nหมายเหตุคำสั่งซื้อ: ${order.note}` : "",
    "",
    copy.ctaUrl,
  ].join("\n");
}

function buildItemRows(items: OrderItemRow[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e6eddf;">
            <div style="font-weight:700;color:#17210f;">${escapeHtml(item.product_name)}</div>
            <div style="font-size:13px;color:#667085;margin-top:2px;">${money(item.unit_price)} / ชิ้น</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #e6eddf;text-align:center;color:#17210f;font-weight:700;">${item.quantity}</td>
          <td style="padding:14px 0;border-bottom:1px solid #e6eddf;text-align:right;color:#17210f;font-weight:800;">${money(item.subtotal)}</td>
        </tr>`
    )
    .join("");
}

function row(label: string, value: string, strong = false) {
  return `
    <tr>
      <td style="padding:6px 0;color:#667085;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;text-align:right;color:#17210f;font-weight:${strong ? "800" : "700"};">${escapeHtml(value)}</td>
    </tr>`;
}

function buildEmail(order: OrderEmailRow, items: OrderItemRow[], copy: EmailCopy) {
  const address = shippingAddress(order);
  const isAdmin = copy.audience === "admin";
  const text = buildPlainText(order, items, copy);

  const html = `
<!doctype html>
<html>
  <body style="margin:0;background:#eef6e9;padding:28px 12px;font-family:Arial,'Noto Sans Thai',sans-serif;color:#17210f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;">
      <tr>
        <td style="padding:0 0 14px;">
          <div style="font-size:28px;font-weight:900;letter-spacing:.04em;color:#73b72d;line-height:1;">swizer</div>
          <div style="font-size:12px;font-weight:800;letter-spacing:.34em;color:#73b72d;">SUPERFOOD</div>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border:1px solid #d8e3d1;border-radius:16px;overflow:hidden;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background:#10140f;padding:28px 30px;color:#ffffff;">
                <div style="font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#9bd35d;">${escapeHtml(copy.eyebrow)}</div>
                <h1 style="font-size:28px;line-height:1.25;margin:10px 0 8px;">${escapeHtml(copy.heading)}</h1>
                <p style="margin:0;color:#d7e7cf;font-size:15px;line-height:1.7;">${escapeHtml(copy.intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f9f0;border:1px solid #dbe7cf;border-radius:12px;">
                  <tr>
                    <td style="padding:18px;">
                      <div style="font-size:13px;color:#667085;margin-bottom:4px;">เลขคำสั่งซื้อ</div>
                      <div style="font-size:20px;font-weight:900;color:#17210f;">${escapeHtml(order.id)}</div>
                    </td>
                    <td style="padding:18px;text-align:right;">
                      <div style="font-size:13px;color:#667085;margin-bottom:4px;">ยอดรวม</div>
                      <div style="font-size:24px;font-weight:900;color:#4f8f13;">${money(order.total)}</div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0 4px;">
                  <tr>
                    <td style="padding:8px 0;color:#667085;">วันที่สั่งซื้อ</td>
                    <td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(formatDate(order.created_at))}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#667085;">ช่องทางชำระเงิน</td>
                    <td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(paymentMethodLabel(order.payment_method))}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#667085;">สถานะการชำระเงิน</td>
                    <td style="padding:8px 0;text-align:right;">
                      <span style="display:inline-block;background:#e8f7df;color:#31750b;border:1px solid #bde7a3;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:800;">${escapeHtml(paymentStatusLabel(order.payment_status))}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#667085;">สถานะคำสั่งซื้อ</td>
                    <td style="padding:8px 0;text-align:right;">
                      <span style="display:inline-block;${statusBadgeStyle(order.status)}border-radius:999px;padding:4px 10px;font-size:12px;font-weight:800;">${escapeHtml(orderStatusLabel(order.status))}</span>
                    </td>
                  </tr>
                  ${
                    order.tracking_number
                      ? `<tr>
                          <td style="padding:8px 0;color:#667085;">เลขพัสดุ/เลขติดตาม</td>
                          <td style="padding:8px 0;text-align:right;font-weight:800;color:#17210f;">${escapeHtml(order.tracking_number)}</td>
                        </tr>`
                      : ""
                  }
                </table>

                <h2 style="font-size:18px;margin:24px 0 8px;color:#17210f;">รายการสินค้า</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <thead>
                    <tr>
                      <th style="padding:9px 0;border-bottom:2px solid #cfdcc6;text-align:left;color:#667085;font-size:12px;">สินค้า</th>
                      <th style="padding:9px 0;border-bottom:2px solid #cfdcc6;text-align:center;color:#667085;font-size:12px;">จำนวน</th>
                      <th style="padding:9px 0;border-bottom:2px solid #cfdcc6;text-align:right;color:#667085;font-size:12px;">รวม</th>
                    </tr>
                  </thead>
                  <tbody>${buildItemRows(items)}</tbody>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;">
                  ${row("ยอดสินค้า", money(order.subtotal))}
                  ${row("ค่าจัดส่ง", Number(order.shipping_fee) > 0 ? money(order.shipping_fee) : "ฟรี")}
                  ${row("ยอดรวมทั้งหมด", money(order.total), true)}
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;background:#fbfcfa;border:1px solid #e2eadb;border-radius:12px;">
                  <tr>
                    <td style="padding:18px;">
                      <h2 style="font-size:17px;margin:0 0 8px;color:#17210f;">${isAdmin ? "ข้อมูลลูกค้าและจัดส่ง" : "รายละเอียดการจัดส่ง"}</h2>
                      <p style="white-space:pre-line;margin:0;color:#344054;line-height:1.75;">${escapeHtml(address)}</p>
                      ${order.note ? `<p style="margin:14px 0 0;color:#344054;"><strong>หมายเหตุคำสั่งซื้อ:</strong> ${escapeHtml(order.note)}</p>` : ""}
                    </td>
                  </tr>
                </table>

                <div style="text-align:center;margin-top:26px;">
                  <a href="${escapeHtml(copy.ctaUrl)}" style="display:inline-block;background:#65b91d;color:#ffffff;text-decoration:none;border-radius:10px;padding:13px 22px;font-weight:900;">${escapeHtml(copy.ctaLabel)}</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 6px 0;text-align:center;color:#667085;font-size:12px;line-height:1.6;">
          อีเมลนี้ส่งอัตโนมัติจาก SwizerStore<br>
          หากข้อมูลไม่ถูกต้อง กรุณาติดต่อทีมงานพร้อมแจ้งเลขคำสั่งซื้อ ${escapeHtml(order.id)}
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, text };
}

function appUrl(path: string) {
  const config = useRuntimeConfig();
  const baseUrl = String(config.baseUrl || "").replace(/\/$/, "");
  return `${baseUrl}${path}`;
}

export async function sendOrderPaidEmails(
  orderId: string,
  options: { force?: boolean; purpose?: "payment" | "status_update" } = {}
) {
  await ensureOrderTrackingSchema();

  const orders = await query<OrderEmailRow>(
     `SELECT
        o.id,
        o.status,
        o.tracking_number,
        o.payment_status,
       o.payment_method,
       o.subtotal,
       o.shipping_fee,
       o.total,
       o.note,
       o.created_at,
       o.confirmation_email_sent_at,
       c.first_name,
       c.last_name,
       c.email,
       c.phone,
       c.address,
       c.address_line2,
       c.subdistrict,
       c.district,
       c.province,
       c.postal_code,
       c.delivery_note
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.id = ?
     LIMIT 1`,
    [orderId]
  );

  const order = orders[0];
  if (!order || order.payment_status !== "success" || (!options.force && order.confirmation_email_sent_at)) {
    return { sent: false, reason: "Order is not ready for email" };
  }

  const items = await query<OrderItemRow>(
    "SELECT product_name, unit_price, quantity, subtotal FROM order_items WHERE order_id = ?",
    [orderId]
  );
  const isStatusUpdate = options.purpose === "status_update";
  const statusLabel = orderStatusLabel(order.status);

  const customerEmail = buildEmail(order, items, {
    audience: "customer",
    eyebrow: isStatusUpdate ? "Order status updated" : "Payment confirmed",
    heading: isStatusUpdate ? `อัปเดตสถานะคำสั่งซื้อ: ${statusLabel}` : "ชำระเงินสำเร็จแล้ว",
    intro: isStatusUpdate
      ? `คำสั่งซื้อ ${order.id} ถูกปรับสถานะเป็น "${statusLabel}" แล้ว และคำสั่งซื้อนี้ชำระเงินเรียบร้อยแล้ว รายละเอียดคำสั่งซื้อและที่อยู่จัดส่งอยู่ด้านล่าง`
      : "ขอบคุณสำหรับคำสั่งซื้อ ทีมงานได้รับยอดชำระเงินเรียบร้อยแล้ว และจะจัดเตรียมสินค้าเพื่อจัดส่งตามรายละเอียดด้านล่าง",
    ctaLabel: "ดูรายละเอียดคำสั่งซื้อ",
    ctaUrl: appUrl(`/order/${encodeURIComponent(order.id)}/success`),
  });

  const customerResult = await sendMail({
    to: [order.email],
    subject: isStatusUpdate
      ? `อัปเดตสถานะคำสั่งซื้อ ${order.id}: ${statusLabel} | SwizerStore`
      : `ยืนยันคำสั่งซื้อ ${order.id} | SwizerStore`,
    ...customerEmail,
  });

  const adminEmails = await getActiveAdminEmailAddresses();

  if (adminEmails.length && !isStatusUpdate) {
    const adminBody = buildEmail(order, items, {
      audience: "admin",
      eyebrow: "New paid order",
      heading: "มีคำสั่งซื้อใหม่ที่ชำระเงินแล้ว",
      intro: `ลูกค้า ${order.first_name} ${order.last_name} ชำระเงินสำเร็จแล้ว กรุณาตรวจสอบสินค้าและเตรียมดำเนินการจัดส่ง`,
      ctaLabel: "เปิดคำสั่งซื้อใน Admin",
      ctaUrl: appUrl(`/Admin/Orders?id=${encodeURIComponent(order.id)}`),
    });

    await sendMail({
      to: adminEmails,
      subject: `คำสั่งซื้อใหม่ ${order.id} | SwizerStore Admin`,
      ...adminBody,
    });
  }

  if (!customerResult.skipped) {
    await query(
      "UPDATE orders SET confirmation_email_sent_at = CURRENT_TIMESTAMP WHERE id = ? AND confirmation_email_sent_at IS NULL",
      [orderId]
    );
  }

  return { sent: !customerResult.skipped, adminNotified: Boolean(adminEmails.length && !isStatusUpdate) };
}
