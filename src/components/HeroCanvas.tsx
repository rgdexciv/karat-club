"use client";

import { useEffect, useRef } from "react";

// Fixed-position hero background video. Replaces the earlier WebGL ring
// scene — the source is a rendered product film, so it reads far more
// like real jewellery than primitive geometry ever could. Muted +
// playsInline + loop so it autoplays on every browser (incl. iOS Safari),
// and a dark scrim keeps the ParallaxHero copy legible over it.
//
// The source clip has an aggressive camera push-in; at native speed that
// reads as a jarring zoom while the page sits still. Slowing playback turns
// it into a slow, deliberate drift that feels intentional rather than glitchy.
const PLAYBACK_RATE = 0.4;

export default function HeroCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = PLAYBACK_RATE;
  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-onyx" aria-hidden="true">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src="/hero_loop.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-onyx/40 via-onyx/20 to-onyx/70" />
    </div>
  );
}
