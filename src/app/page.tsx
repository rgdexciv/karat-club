import Link from "next/link";
import ParallaxHero from "@/components/ParallaxHero";
import HeroCanvas from "@/components/HeroCanvas";

// Static showcase data for the landing page — the live catalogue is
// served from Postgres via the checkout flow; the landing stays static
// and deployable without a database connection.
const SHOWCASE = [
  {
    slug: "meridian-signet",
    name: "Meridian Signet",
    detail: "18k yellow gold · lost-wax cast",
    price: "₱42,800",
    edition: "Run of 30",
  },
  {
    slug: "hourline-chain",
    name: "Hourline Chain",
    detail: "18k gold · hand-drawn links",
    price: "₱68,500",
    edition: "Run of 18",
  },
  {
    slug: "quiet-carat-band",
    name: "Quiet Carat Band",
    detail: "18k gold · bezel-set white sapphire",
    price: "₱55,200",
    edition: "Run of 24",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <HeroCanvas />
      <ParallaxHero />

      {/* Collection — asymmetric editorial column layout */}
      <section
        id="collection"
        className="relative bg-onyx px-6 py-32 md:px-16"
      >
        <div className="mb-20 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display max-w-xl text-4xl font-medium md:text-6xl">
            The current run
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-ivory-dim">
            Three pieces, cast this quarter. Each engraved with its run
            number — nothing repeats.
          </p>
        </div>

        <ul className="grid gap-y-24 md:grid-cols-12 md:gap-x-8">
          {SHOWCASE.map((piece, index) => (
            <li
              key={piece.slug}
              className={
                index === 0
                  ? "md:col-span-6 md:col-start-1"
                  : index === 1
                    ? "md:col-span-5 md:col-start-8 md:mt-40"
                    : "md:col-span-6 md:col-start-4 md:mt-24"
              }
            >
              <article className="group border-t border-line pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-3xl font-medium transition-colors duration-300 group-hover:text-gold md:text-4xl">
                    {piece.name}
                  </h3>
                  <span className="shrink-0 text-sm text-gold">{piece.price}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-4 text-xs tracking-[0.15em] text-ivory-dim uppercase">
                  <span>{piece.detail}</span>
                  <span>{piece.edition}</span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* Manifesto */}
      <section className="relative bg-onyx-soft px-6 py-40 md:px-16">
        <blockquote className="font-display mx-auto max-w-3xl text-center text-3xl leading-snug font-medium md:text-5xl">
          “Jewelry should not be
          <em className="text-gold italic"> merchandise</em>. It should be a
          date, a hand, a decision — kept in metal.”
        </blockquote>
        <p className="mt-10 text-center text-xs tracking-[0.3em] text-ivory-dim uppercase">
          The founders — est. 2021
        </p>
      </section>

      {/* CTA */}
      <section className="relative bg-onyx px-6 py-32 text-center md:px-16">
        <h2 className="font-display text-4xl font-medium md:text-6xl">
          The next run opens soon.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ivory-dim">
          Members see it first, forty-eight hours before the public. Card,
          GCash, and Maya accepted.
        </p>
        <Link
          href="/login"
          className="mt-12 inline-block border border-gold px-10 py-4 text-xs tracking-[0.3em] text-gold uppercase transition-colors duration-200 hover:bg-gold hover:text-onyx"
        >
          Join the Club
        </Link>
      </section>

      <footer className="border-t border-line px-6 py-10 text-xs text-ivory-dim md:px-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} Karat Club, Makati</span>
          <span>18k, always. Assay-certified.</span>
        </div>
      </footer>
    </>
  );
}
