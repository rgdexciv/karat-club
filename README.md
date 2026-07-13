# Karat Club

Premium jewelry e-commerce with an interactive WebGL experience. Hand-finished 18k pieces, cast in small runs — members-first drops.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind CSS v4)
- **React Three Fiber + drei + Three.js** — WebGL hero (procedural gold signet ring, pointer-reactive, scroll-driven parallax path)
- **GSAP ScrollTrigger + Lenis** — smooth scrolling synced to a single rAF loop; scroll progress bridged to the 3D scene via a shared mutable module (`src/lib/scrollState.ts`), so DOM animation and WebGL stay decoupled
- **NextAuth (credentials, JWT)** — registration + sign-in, bcrypt-hashed passwords, middleware-protected `/account` and `/checkout`
- **PostgreSQL + Prisma** — users, products, orders, order items, payments
- **PayMongo** — hosted checkout sessions (card / GCash / Maya), signature-verified webhooks updating order + payment status

## Architecture

```
src/
├── app/
│   ├── page.tsx                     # Landing: WebGL hero + editorial sections
│   ├── layout.tsx                   # Fonts (Cormorant/Montserrat), providers, Lenis
│   ├── login/page.tsx               # Sign in / register
│   ├── account/page.tsx             # Order history (protected)
│   └── api/
│       ├── auth/[...nextauth]/      # NextAuth handler
│       ├── auth/register/           # Sign-up endpoint
│       ├── checkout/                # Creates order + PayMongo checkout session
│       └── webhooks/paymongo/       # payment.paid / payment.failed → DB status
├── components/
│   ├── Scene.tsx                    # R3F canvas, lights, env map, ring mesh
│   ├── HeroCanvas.tsx               # ssr:false wrapper
│   ├── ParallaxHero.tsx             # GSAP ScrollTrigger HTML overlay
│   ├── SmoothScroll.tsx             # Lenis ↔ GSAP ticker bridge
│   ├── AuthGuard.tsx                # Server-side session guard
│   └── Navbar.tsx
├── lib/
│   ├── auth.ts                      # NextAuth options
│   ├── prisma.ts                    # Singleton client
│   ├── paymongo.ts                  # Typed API client + webhook signature check
│   └── scrollState.ts               # DOM ↔ WebGL scroll bridge
└── middleware.ts                    # Route protection
prisma/schema.prisma                 # User / Product / Order / OrderItem / Payment
```

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, NEXTAUTH_SECRET, PayMongo keys
npx prisma migrate dev
npm run dev
```

## Environment variables

See `.env.example`. Landing page runs without a database; auth, account, and checkout require `DATABASE_URL`, `NEXTAUTH_SECRET`, and PayMongo keys.

## Swapping in a real 3D asset

`Scene.tsx` builds the ring from primitives. Replace `<Ring />` internals with a draco-compressed GLB via `useGLTF` — the parallax path and pointer damping are asset-agnostic.
