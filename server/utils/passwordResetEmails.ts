import { sendMail } from "~~/server/utils/email";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function appUrl(path: string) {
  const config = useRuntimeConfig();
  const baseUrl = String(config.baseUrl || "http://localhost:3000").replace(/\/$/, "");
  return `${baseUrl}${path}`;
}

function buildPasswordResetEmail(input: { username: string; resetUrl: string }) {
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
                <div style="font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#9bd35d;">Password reset</div>
                <h1 style="font-size:28px;line-height:1.25;margin:10px 0 8px;">ตั้งรหัสผ่านใหม่</h1>
                <p style="margin:0;color:#d7e7cf;font-size:15px;line-height:1.7;">เราได้รับคำขอตั้งรหัสผ่านใหม่สำหรับบัญชี ${escapeHtml(input.username)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px;">
                <p style="margin:0 0 16px;color:#344054;line-height:1.75;">กดปุ่มด้านล่างเพื่อสร้างรหัสผ่านใหม่ ลิงก์นี้จะหมดอายุภายใน 30 นาที และใช้ได้เพียงครั้งเดียว</p>
                <div style="text-align:center;margin:26px 0;">
                  <a href="${escapeHtml(input.resetUrl)}" style="display:inline-block;background:#83c63d;color:#ffffff;text-decoration:none;border-radius:10px;padding:13px 22px;font-weight:900;">ตั้งรหัสผ่านใหม่</a>
                </div>
                <p style="margin:0;color:#667085;font-size:13px;line-height:1.7;">ถ้าปุ่มไม่ทำงาน ให้คัดลอกลิงก์นี้ไปเปิดในเบราว์เซอร์:</p>
                <p style="word-break:break-all;margin:8px 0 0;color:#517a24;font-size:13px;line-height:1.7;">${escapeHtml(input.resetUrl)}</p>
                <p style="margin:22px 0 0;color:#667085;font-size:13px;line-height:1.7;">หากคุณไม่ได้ขอตั้งรหัสผ่านใหม่ สามารถละเว้นอีเมลนี้ได้ รหัสผ่านเดิมจะยังใช้งานได้ตามปกติ</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 6px 0;text-align:center;color:#667085;font-size:12px;line-height:1.6;">
          อีเมลนี้ส่งอัตโนมัติจาก SwizerStore
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "ตั้งรหัสผ่านใหม่ | SwizerStore",
    "",
    `เราได้รับคำขอตั้งรหัสผ่านใหม่สำหรับบัญชี ${input.username}`,
    "ลิงก์นี้จะหมดอายุภายใน 30 นาที และใช้ได้เพียงครั้งเดียว",
    "",
    input.resetUrl,
    "",
    "หากคุณไม่ได้ขอตั้งรหัสผ่านใหม่ สามารถละเว้นอีเมลนี้ได้",
  ].join("\n");

  return { html, text };
}

export async function sendPasswordResetEmail(input: { to: string; username: string; token: string }) {
  const resetUrl = appUrl(`/reset-password?token=${encodeURIComponent(input.token)}`);
  const email = buildPasswordResetEmail({ username: input.username, resetUrl });

  return await sendMail({
    to: [input.to],
    subject: "ตั้งรหัสผ่านใหม่ | SwizerStore",
    ...email,
  });
}
