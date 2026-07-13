"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/scrollState";

gsap.registerPlugin(ScrollTrigger);

/**
 * HTML overlay for the hero sequence. A single ScrollTrigger spans the
 * whole hero scroll distance and writes normalized progress into
 * `scrollState` — the WebGL ring reads it every frame. Copy layers move
 * on their own parallax offsets inside the same timeline.
 */
export default function ParallaxHero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    // On mobile both acts span nearly the full width at overlapping bottom
    // offsets, so act 2 must exit before act 3 enters; on desktop they sit
    // left/right and stay visible together.
    mm.add(
      { isMobile: "(max-width: 767px)", isDesktop: "(min-width: 768px)" },
      (context) => {
        const { isMobile } = context.conditions as { isMobile: boolean };

        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            scrollState.progress = self.progress;
          },
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });

        timeline
          .to("[data-hero-title]", { yPercent: -35, opacity: 0.1, ease: "none" }, 0)
          .to("[data-hero-meta]", { yPercent: -120, ease: "none" }, 0)
          .fromTo(
            "[data-hero-act='2']",
            { opacity: 0, y: 80 },
            { opacity: 1, y: 0, ease: "power2.out" },
            0.25,
          );

        if (isMobile) {
          timeline.to(
            "[data-hero-act='2']",
            { opacity: 0, y: -60, ease: "power2.in" },
            0.48,
          );
        }

        timeline.fromTo(
          "[data-hero-act='3']",
          { opacity: 0, y: 80 },
          { opacity: 1, y: 0, ease: "power2.out" },
          0.62,
        );
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative h-[300vh]">
      {/* Act I — pinned viewport content */}
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-6 md:px-16">
        <div data-hero-title className="max-w-4xl">
          <p className="mb-6 font-body text-xs tracking-[0.35em] text-gold uppercase">
            Karat Club — Manila
          </p>
          <h1 className="font-display text-[clamp(3rem,9vw,5.5rem)] leading-[0.95] font-medium">
            Gold that keeps
            <br />
            <em className="text-gold italic">its own hours.</em>
          </h1>
        </div>

        <div
          data-hero-meta
          className="absolute right-6 bottom-24 hidden max-w-55 text-right md:block"
        >
          <p className="text-sm leading-relaxed text-ivory-dim">
            Hand-finished 18k pieces, cast in small runs. No restocks, no
            seasons — when a run closes, it closes.
          </p>
        </div>

        {/* Act II */}
        <div
          data-hero-act="2"
          className="absolute bottom-1/3 left-6 max-w-md opacity-0 md:left-16"
        >
          <h2 className="font-display text-3xl font-medium md:text-4xl">
            Cast, not stamped.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
            Every band begins as lost-wax — carved, cast, and finished by two
            pairs of hands in our Makati atelier.
          </p>
        </div>

        {/* Act III */}
        <div
          data-hero-act="3"
          className="absolute right-6 bottom-1/4 max-w-md text-right opacity-0 md:right-16"
        >
          <h2 className="font-display text-3xl font-medium md:text-4xl">
            Members first.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
            Runs open to the Club forty-eight hours before anyone else.
            Most never make it past that window.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-ivory-dim uppercase">
          Scroll
        </div>
      </div>
    </div>
  );
}
