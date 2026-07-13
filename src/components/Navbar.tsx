"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-ivory/10 bg-onyx/30 px-6 py-5 backdrop-blur-xl backdrop-saturate-150 md:px-16">
      <Link
        href="/"
        className="font-display text-xl tracking-wide text-ivory"
      >
        Karat<span className="text-gold">·</span>Club
      </Link>
      <nav className="flex items-center gap-6 text-xs tracking-[0.2em] uppercase">
        <Link href="/#collection" className="hidden text-ivory-dim transition-colors duration-200 hover:text-gold sm:inline-block">
          Collection
        </Link>
        {status === "authenticated" ? (
          <>
            <Link href="/account" className="text-ivory-dim transition-colors duration-200 hover:text-gold">
              Account
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="cursor-pointer text-ivory-dim transition-colors duration-200 hover:text-gold"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="border border-gold/60 px-4 py-2 text-gold transition-colors duration-200 hover:bg-gold hover:text-onyx"
          >
            {session ? "Account" : "Join the Club"}
          </Link>
        )}
      </nav>
    </header>
  );
}
