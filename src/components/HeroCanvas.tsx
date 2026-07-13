"use client";

import dynamic from "next/dynamic";

// R3F's Canvas touches window/WebGL at mount; skip SSR entirely so the
// server render stays clean and the canvas hydrates on the client only.
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function HeroCanvas() {
  return <Scene />;
}
