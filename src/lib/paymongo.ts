/**
 * Minimal typed PayMongo API client (server-side only).
 * Docs: https://developers.paymongo.com/reference
 */

const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

function getSecretKey(): string {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) throw new Error("PAYMONGO_SECRET_KEY is not configured");
  return key;
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${getSecretKey()}:`).toString("base64")}`;
}

export interface PayMongoPaymentIntent {
  id: string;
  attributes: {
    amount: number;
    currency: string;
    status: string;
    client_key: string;
    next_action: { redirect?: { url: string } } | null;
  };
}

export interface PayMongoCheckoutSession {
  id: string;
  attributes: {
    checkout_url: string;
    payment_intent: { id: string };
    status: string;
  };
}

async function payMongoRequest<T>(
  path: string,
  init: { method: string; body?: unknown },
): Promise<T> {
  const response = await fetch(`${PAYMONGO_API_BASE}${path}`, {
    method: init.method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  const json = (await response.json()) as { data?: T; errors?: { detail: string }[] };

  if (!response.ok || !json.data) {
    const detail = json.errors?.[0]?.detail ?? `PayMongo request failed (${response.status})`;
    throw new Error(detail);
  }
  return json.data;
}

/**
 * Creates a hosted Checkout Session supporting card, GCash, and Maya.
 * Amounts are in centavos.
 */
export async function createCheckoutSession(params: {
  lineItems: { name: string; amountCents: number; quantity: number }[];
  referenceNumber: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<PayMongoCheckoutSession> {
  return payMongoRequest<PayMongoCheckoutSession>("/checkout_sessions", {
    method: "POST",
    body: {
      data: {
        attributes: {
          line_items: params.lineItems.map((item) => ({
            name: item.name,
            amount: item.amountCents,
            currency: "PHP",
            quantity: item.quantity,
          })),
          payment_method_types: ["card", "gcash", "paymaya"],
          reference_number: params.referenceNumber,
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          send_email_receipt: true,
        },
      },
    },
  });
}

export async function createPaymentIntent(params: {
  amountCents: number;
  description: string;
  metadata?: Record<string, string>;
}): Promise<PayMongoPaymentIntent> {
  return payMongoRequest<PayMongoPaymentIntent>("/payment_intents", {
    method: "POST",
    body: {
      data: {
        attributes: {
          amount: params.amountCents,
          currency: "PHP",
          payment_method_allowed: ["card", "gcash", "paymaya"],
          capture_type: "automatic",
          description: params.description,
          metadata: params.metadata,
        },
      },
    },
  });
}

/**
 * Verifies a PayMongo webhook signature.
 * Header format: "t=<timestamp>,te=<test_sig>,li=<live_sig>"
 * Signature = HMAC-SHA256(`${timestamp}.${rawBody}`, webhookSecret)
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => part.split("=") as [string, string]),
  );
  const timestamp = parts.t;
  const signature = parts.li ?? parts.te;
  if (!timestamp || !signature) return false;

  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
