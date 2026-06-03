import { sendMail } from "~~/server/utils/email";

interface ContactEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  ip?: string;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textToHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function buildAdminEmail(input: ContactEmailInput) {
  const html = `
<!doctype html>
<html>
  <body style="margin:0;background:#eef6e9;padding:28px 12px;font-family:Arial,'Noto Sans Thai',sans-serif;color:#17210f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;">
      <tr>
        <td style="padding:0 0 14px;">
          <div style="font-size:34px;font-weight:900;letter-spacing:.04em;color:#83c63d;line-height:1;">swizer</div>
          <div style="font-size:12px;font-weight:800;letter-spacing:.34em;color:#83c63d;">SUPERFOOD</div>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border:1px solid #d8e3d1;border-radius:16px;overflow:hidden;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background:#10140f;padding:28px 30px;color:#ffffff;">
                <div style="font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#9bd35d;">Contact form</div>
                <h1 style="font-size:28px;line-height:1.25;margin:10px 0 8px;">มีข้อความติดต่อใหม่</h1>
                <p style="margin:0;color:#d7e7cf;font-size:15px;line-height:1.7;">จากหน้า Contact ของ SwizerStore</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="width:140px;padding:10px 0;color:#667085;font-size:13px;font-weight:800;">ชื่อ</td>
                    <td style="padding:10px 0;color:#17210f;font-size:15px;font-weight:800;">${escapeHtml(input.name)}</td>
                  </tr>
                  <tr>
                    <td style="width:140px;padding:10px 0;color:#667085;font-size:13px;font-weight:800;">อีเมล</td>
                    <td style="padding:10px 0;color:#517a24;font-size:15px;font-weight:800;">${escapeHtml(input.email)}</td>
                  </tr>
                  <tr>
                    <td style="width:140px;padding:10px 0;color:#667085;font-size:13px;font-weight:800;">หัวข้อ</td>
                    <td style="padding:10px 0;color:#17210f;font-size:15px;font-weight:800;">${escapeHtml(input.subject)}</td>
                  </tr>
                  ${
                    input.ip
                      ? `<tr><td style="width:140px;padding:10px 0;color:#667085;font-size:13px;font-weight:800;">IP</td><td style="padding:10px 0;color:#667085;font-size:13px;">${escapeHtml(input.ip)}</td></tr>`
                      : ""
                  }
                </table>
                <div style="height:1px;background:#e4eadf;margin:18px 0 22px;"></div>
                <div style="font-size:13px;font-weight:800;color:#667085;margin-bottom:8px;">ข้อความ</div>
                <div style="background:#f6faf2;border:1px solid #dfead7;border-radius:12px;padding:18px;color:#17210f;font-size:15px;line-height:1.8;">
                  ${textToHtml(input.message)}
                </div>
                <div style="text-align:center;margin:26px 0 0;">
                  <a href="mailto:${escapeHtml(input.email)}" style="display:inline-block;background:#83c63d;color:#ffffff;text-decoration:none;border-radius:10px;padding:13px 22px;font-weight:900;">ตอบกลับลูกค้า</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 6px 0;text-align:center;color:#667085;font-size:12px;line-height:1.6;">
          อีเมลนี้ส่งอัตโนมัติจากฟอร์มติดต่อ SwizerStore
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "มีข้อความติดต่อใหม่ | SwizerStore",
    "",
    `ชื่อ: ${input.name}`,
    `อีเมล: ${input.email}`,
    `หัวข้อ: ${input.subject}`,
    input.ip ? `IP: ${input.ip}` : "",
    "",
    "ข้อความ:",
    input.message,
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}

function buildCustomerEmail(input: ContactEmailInput) {
  const html = `
<!doctype html>
<html>
  <body style="margin:0;background:#eef6e9;padding:28px 12px;font-family:Arial,'Noto Sans Thai',sans-serif;color:#17210f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;">
      <tr>
        <td style="padding:0 0 14px;">
          <div style="font-size:34px;font-weight:900;letter-spacing:.04em;color:#83c63d;line-height:1;">swizer</div>
          <div style="font-size:12px;font-weight:800;letter-spacing:.34em;color:#83c63d;">SUPERFOOD</div>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border:1px solid #d8e3d1;border-radius:16px;overflow:hidden;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background:#10140f;padding:28px 30px;color:#ffffff;">
                <div style="font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#9bd35d;">Message received</div>
                <h1 style="font-size:28px;line-height:1.25;margin:10px 0 8px;">เราได้รับข้อความของคุณแล้ว</h1>
                <p style="margin:0;color:#d7e7cf;font-size:15px;line-height:1.7;">ขอบคุณคุณ ${escapeHtml(input.name)} ที่ติดต่อ SwizerStore</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px;">
                <p style="margin:0 0 16px;color:#344054;line-height:1.75;">ทีมงานได้รับข้อความของคุณแล้ว และจะรีบติดต่อกลับทางอีเมลนี้โดยเร็วที่สุด</p>
                <div style="background:#f6faf2;border:1px solid #dfead7;border-radius:12px;padding:18px;margin-top:20px;">
                  <div style="font-size:13px;font-weight:800;color:#667085;margin-bottom:6px;">หัวข้อที่ส่งมา</div>
                  <div style="font-size:16px;font-weight:900;color:#17210f;">${escapeHtml(input.subject)}</div>
                </div>
                <p style="margin:22px 0 0;color:#667085;font-size:13px;line-height:1.7;">หากต้องการแจ้งข้อมูลเพิ่มเติม สามารถตอบกลับอีเมลนี้ หรือส่งข้อความใหม่ผ่านหน้า Contact ได้เลย</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 6px 0;text-align:center;color:#667085;font-size:12px;line-height:1.6;">
          SwizerStore
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "เราได้รับข้อความของคุณแล้ว | SwizerStore",
    "",
    `ขอบคุณคุณ ${input.name} ที่ติดต่อ SwizerStore`,
    "ทีมงานได้รับข้อความของคุณแล้ว และจะรีบติดต่อกลับโดยเร็วที่สุด",
    "",
    `หัวข้อ: ${input.subject}`,
  ].join("\n");

  return { html, text };
}

export async function sendContactEmails(input: ContactEmailInput) {
  const config = useRuntimeConfig();
  const adminEmail = String(config.adminEmail || "info@swizerstore.com").trim();
  const adminEmailBody = buildAdminEmail(input);

  const adminResult = await sendMail({
    to: [adminEmail],
    subject: `ข้อความติดต่อใหม่: ${input.subject}`,
    replyTo: input.email,
    ...adminEmailBody,
  });

  if (adminResult.skipped) {
    return { sent: false, reason: adminResult.reason || "Contact email was skipped" };
  }

  try {
    const customerEmailBody = buildCustomerEmail(input);
    await sendMail({
      to: [input.email],
      subject: "เราได้รับข้อความของคุณแล้ว | SwizerStore",
      ...customerEmailBody,
    });
  } catch (error) {
    console.warn("Failed to send contact acknowledgement email", error);
  }

  return { sent: true };
}
