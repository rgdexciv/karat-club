import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/paymongo";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "You must be signed in to check out" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid cart payload" },
      { status: 400 },
    );
  }

  try {
    const productIds = parsed.data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    for (const item of parsed.data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: "One or more products are unavailable" },
          { status: 400 },
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `"${product.name}" is out of stock` },
          { status: 409 },
        );
      }
    }

    const totalCents = parsed.data.items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + product.priceCents * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "AWAITING_PAYMENT",
        totalCents,
        items: {
          create: parsed.data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceCents: productMap.get(item.productId)!.priceCents,
          })),
        },
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const checkoutSession = await createCheckoutSession({
      lineItems: parsed.data.items.map((item) => {
        const product = productMap.get(item.productId)!;
        return {
          name: product.name,
          amountCents: product.priceCents,
          quantity: item.quantity,
        };
      }),
      referenceNumber: order.id,
      successUrl: `${siteUrl}/account?payment=success`,
      cancelUrl: `${siteUrl}/account?payment=cancelled`,
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymongoPaymentIntentId: checkoutSession.attributes.payment_intent.id,
        amountCents: totalCents,
      },
    });

    return NextResponse.json({
      success: true,
      data: { checkoutUrl: checkoutSession.attributes.checkout_url, orderId: order.id },
    });
  } catch (error) {
    console.error("[checkout] failed:", error);
    return NextResponse.json(
      { success: false, error: "Checkout could not be started. Please try again." },
      { status: 500 },
    );
  }
}
