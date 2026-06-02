import net from "node:net";
import tls from "node:tls";

interface MailInput {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  fromAddress: string;
  fromHeader: string;
  secure: boolean;
}

function getSmtpConfig(): SmtpConfig | null {
  const config = useRuntimeConfig();
  const host = String(config.smtpHost || "").trim();
  const rawFrom = String(config.smtpFrom || config.smtpUser || "").trim();
  const fromAddress = extractEmailAddress(rawFrom);

  if (!host || !fromAddress) return null;

  return {
    host,
    port: Number(config.smtpPort || 587),
    user: String(config.smtpUser || "").trim() || undefined,
    pass: String(config.smtpPass || "").trim() || undefined,
    fromAddress,
    fromHeader: rawFrom,
    secure: String(config.smtpSecure || "").toLowerCase() === "true",
  };
}

function extractEmailAddress(value: string) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] || value).trim();
}

function encodeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dotStuff(value: string) {
  return value.replace(/^\./gm, "..");
}

async function connect(config: SmtpConfig) {
  const socket = config.secure
    ? tls.connect({ host: config.host, port: config.port, servername: config.host })
    : net.connect({ host: config.host, port: config.port });

  socket.setTimeout(15000);

  await new Promise<void>((resolve, reject) => {
    socket.once(config.secure ? "secureConnect" : "connect", resolve);
    socket.once("error", reject);
    socket.once("timeout", () => reject(new Error("SMTP connection timed out")));
  });

  return socket;
}

async function readResponse(socket: net.Socket | tls.TLSSocket, bufferRef: { value: string }) {
  return await new Promise<string>((resolve, reject) => {
    const onData = (chunk: Buffer) => {
      bufferRef.value += chunk.toString("utf8");
      const lines = bufferRef.value.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || "";

      if (/^\d{3} /.test(last)) {
        socket.off("data", onData);
        socket.off("error", onError);
        socket.off("timeout", onTimeout);
        const response = bufferRef.value;
        bufferRef.value = "";
        resolve(response);
      }
    };

    const onError = (error: Error) => {
      socket.off("data", onData);
      reject(error);
    };

    const onTimeout = () => {
      socket.off("data", onData);
      reject(new Error("SMTP response timed out"));
    };

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });
}

function assertSmtpOk(response: string, accepted: number[]) {
  const code = Number(response.slice(0, 3));
  if (!accepted.includes(code)) {
    throw new Error(`SMTP error ${response.trim()}`);
  }
}

async function command(socket: net.Socket | tls.TLSSocket, bufferRef: { value: string }, line: string, accepted: number[]) {
  socket.write(`${line}\r\n`);
  const response = await readResponse(socket, bufferRef);
  assertSmtpOk(response, accepted);
  return response;
}

async function upgradeToTls(socket: net.Socket | tls.TLSSocket, host: string) {
  return await new Promise<tls.TLSSocket>((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: host }, () => resolve(secureSocket));
    secureSocket.once("error", reject);
    secureSocket.once("timeout", () => reject(new Error("SMTP TLS upgrade timed out")));
  });
}

export async function sendMail(input: MailInput) {
  const config = getSmtpConfig();
  if (!config) return { skipped: true, reason: "SMTP is not configured" };

  const recipients = [...new Set(input.to.map((email) => email.trim()).filter(Boolean))];
  if (!recipients.length) return { skipped: true, reason: "No recipients" };

  let socket: net.Socket | tls.TLSSocket = await connect(config);
  const bufferRef = { value: "" };

  try {
    assertSmtpOk(await readResponse(socket, bufferRef), [220]);
    await command(socket, bufferRef, `EHLO ${config.host}`, [250]);

    if (!config.secure && config.port !== 25) {
      await command(socket, bufferRef, "STARTTLS", [220]);
      socket = await upgradeToTls(socket, config.host);
      await command(socket, bufferRef, `EHLO ${config.host}`, [250]);
    }

    if (config.user && config.pass) {
      await command(socket, bufferRef, "AUTH LOGIN", [334]);
      await command(socket, bufferRef, Buffer.from(config.user).toString("base64"), [334]);
      await command(socket, bufferRef, Buffer.from(config.pass).toString("base64"), [235]);
    }

    await command(socket, bufferRef, `MAIL FROM:<${config.fromAddress}>`, [250]);
    for (const recipient of recipients) {
      await command(socket, bufferRef, `RCPT TO:<${recipient}>`, [250, 251]);
    }
    await command(socket, bufferRef, "DATA", [354]);

    const text = input.text || stripHtml(input.html);
    const boundary = `swizer-${Date.now()}`;
    const message = [
      `From: ${config.fromHeader}`,
      `To: ${recipients.join(", ")}`,
      `Subject: ${encodeHeader(input.subject)}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      text,
      "",
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      input.html,
      "",
      `--${boundary}--`,
    ].join("\r\n");

    socket.write(`${dotStuff(message)}\r\n.\r\n`);
    assertSmtpOk(await readResponse(socket, bufferRef), [250]);
    await command(socket, bufferRef, "QUIT", [221]);

    return { skipped: false };
  } finally {
    socket.destroy();
  }
}
