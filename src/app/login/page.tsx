"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type Mode = "signin" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });
        const json = (await response.json()) as {
          success: boolean;
          error?: string;
        };
        if (!json.success) {
          setError(json.error ?? "Registration failed");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx px-6">
      <div className="w-full max-w-md">
        <h1 className="font-display text-4xl font-medium">
          {mode === "signin" ? "Welcome back." : "Join the Club."}
        </h1>
        <p className="mt-3 text-sm text-ivory-dim">
          {mode === "signin"
            ? "Sign in to see your orders and open runs."
            : "Create an account to access members-first drops."}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="block text-xs tracking-[0.2em] text-ivory-dim uppercase">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full border-b border-line bg-transparent py-3 text-ivory outline-none transition-colors focus:border-gold"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-xs tracking-[0.2em] text-ivory-dim uppercase">
              Email <span aria-hidden="true" className="text-gold">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full border-b border-line bg-transparent py-3 text-ivory outline-none transition-colors focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs tracking-[0.2em] text-ivory-dim uppercase">
              Password <span aria-hidden="true" className="text-gold">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full border-b border-line bg-transparent py-3 text-ivory outline-none transition-colors focus:border-gold"
            />
            {mode === "register" && (
              <p className="mt-2 text-xs text-ivory-dim">At least 8 characters.</p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer border border-gold py-4 text-xs tracking-[0.3em] text-gold uppercase transition-colors duration-200 hover:bg-gold hover:text-onyx disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "One moment…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "register" : "signin");
            setError(null);
          }}
          className="mt-8 cursor-pointer text-sm text-ivory-dim underline-offset-4 transition-colors hover:text-gold hover:underline"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already a member? Sign in"}
        </button>
      </div>
    </div>
  );
}
