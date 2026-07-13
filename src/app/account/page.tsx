import { getServerSession } from "next-auth";
import AuthGuard from "@/components/AuthGuard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  FAILED: "Payment failed",
  CANCELLED: "Cancelled",
  FULFILLED: "Fulfilled",
};

function formatPeso(cents: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(cents / 100);
}

async function OrderHistory({ userId }: { userId: string }) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } }, payment: true },
    });

    if (orders.length === 0) {
      return (
        <div className="border-t border-line pt-8">
          <p className="text-ivory-dim">
            No orders yet. When the next run opens, you’ll see it here first.
          </p>
        </div>
      );
    }

    return (
      <ul className="space-y-8">
        {orders.map((order) => (
          <li key={order.id} className="border-t border-line pt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-display text-2xl">
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="text-gold">{formatPeso(order.totalCents)}</span>
            </div>
            <p className="mt-1 text-xs tracking-widest text-ivory-dim uppercase">
              {order.createdAt.toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" · "}
              {order.payment?.paymentMethod ?? "—"}
            </p>
            <ul className="mt-4 space-y-1 text-sm text-ivory-dim">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.product.name} —{" "}
                  {formatPeso(item.unitPriceCents)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    );
  } catch (error) {
    console.error("[account] order query failed:", error);
    return (
      <div className="border-t border-line pt-8">
        <p className="text-red-400">
          We couldn’t load your orders right now. Refresh to try again.
        </p>
      </div>
    );
  }
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-onyx px-6 pt-32 pb-24 md:px-16">
        <h1 className="font-display text-4xl font-medium md:text-5xl">
          {session?.user?.name
            ? `Good to see you, ${session.user.name}.`
            : "Your account."}
        </h1>
        <p className="mt-3 mb-16 text-sm text-ivory-dim">{session?.user?.email}</p>
        <h2 className="font-display mb-8 text-2xl">Order history</h2>
        {session?.user?.id ? <OrderHistory userId={session.user.id} /> : null}
      </div>
    </AuthGuard>
  );
}
