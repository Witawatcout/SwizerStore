type OmiseBody = Record<string, string | number | boolean | undefined | null>;

function getOmiseSecretKey() {
  const config = useRuntimeConfig();
  const key = config.omiseSecretKey as string | undefined;
  if (!key) {
    throw createError({ statusCode: 500, statusMessage: "OMISE_SECRET_KEY is not configured" });
  }
  return key;
}

async function requestOmise<T>(path: string, body?: OmiseBody): Promise<T> {
  const secretKey = getOmiseSecretKey();
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(body || {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }

  const response = await fetch(`https://api.omise.co${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? params : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: data?.message || data?.code || "Omise request failed",
    });
  }

  return data as T;
}

export function toSatang(amount: number) {
  return Math.round(Number(amount) * 100);
}

export async function createCardCharge(input: {
  amount: number;
  token: string;
  description?: string;
}) {
  return requestOmise<any>("/charges", {
    amount: input.amount,
    currency: "thb",
    card: input.token,
    description: input.description,
  });
}

export async function createPromptPaySource(input: { amount: number }) {
  return requestOmise<any>("/sources", {
    type: "promptpay",
    amount: input.amount,
    currency: "thb",
  });
}

export async function createSourceCharge(input: {
  amount: number;
  sourceId: string;
  returnUri: string;
  description?: string;
}) {
  return requestOmise<any>("/charges", {
    amount: input.amount,
    currency: "thb",
    source: input.sourceId,
    return_uri: input.returnUri,
    description: input.description,
  });
}

export async function retrieveCharge(chargeId: string) {
  return requestOmise<any>(`/charges/${encodeURIComponent(chargeId)}`);
}

export async function createRefund(input: {
  chargeId: string;
  amount: number;
}) {
  return requestOmise<any>(`/charges/${encodeURIComponent(input.chargeId)}/refunds`, {
    amount: input.amount,
  });
}

export function isChargeSuccessful(charge: any) {
  return charge?.paid === true || charge?.status === "successful";
}

export function isChargeFailed(charge: any) {
  return charge?.status === "failed" || Boolean(charge?.failure_code);
}
