import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { authOptions } from "@/lib/auth";

/**
 * Server-side guard for protected layouts/pages. Middleware already
 * covers /account and /checkout; this adds defence-in-depth for any
 * surface composed inside it and gives children a guaranteed session.
 */
export default async function AuthGuard({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <>{children}</>;
}
