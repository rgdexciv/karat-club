import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paymongo";

interface PayMongoWebhookEvent {
  data: {
    attributes: {
      type: string;
      data: {
        id: string;
        attributes: {
          payment_intent_id?: string;
          source?: { type?: string };
          failed_message?: string;
        };
      };
    };
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("paymongo-signature");

  const isValid = await verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  let event: PayMongoWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PayMongoWebhookEvent;
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed webhook payload" },
      { status: 400 },
    );
  }

  const eventType = event.data.attributes.type;
  const resource = event.data.attributes.data;
  const paymentIntentId = resource.attributes.payment_intent_id;

  if (!paymentIntentId) {
    // Not a payment event we track; acknowledge so PayMongo stops retrying.
    return NextResponse.json({ success: true, data: null });
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { paymongoPaymentIntentId: paymentIntentId },
    });
    if (!payment) {
      console.warn(`[webhook] no payment for intent ${paymentIntentId}`);
      return NextResponse.json({ success: true, data: null });
    }

    if (eventType === "payment.paid") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paymongoPaymentId: resource.id,
            paymentMethod: resource.attributes.source?.type ?? null,
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID" },
        }),
      ]);
    } else if (eventType === "payment.failed") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            paymongoPaymentId: resource.id,
            failureReason: resource.attributes.failed_message ?? "Unknown failure",
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "FAILED" },
        }),
      ]);
    }

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("[webhook] processing failed:", error);
    // 500 so PayMongo retries delivery
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
