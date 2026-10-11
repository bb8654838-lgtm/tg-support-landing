"use client";

import dynamic from "next/dynamic";

/**
 * The WebGL scene is client-only (Three.js reads `window` on import) and is
 * code-split so the page paints immediately. The placeholder uses the same
 * radial gradient as the scene backdrop, so nothing flashes on swap.
 */
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(109,94,252,0.28),transparent_62%)]" />
  ),
});

export function HeroCanvas() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <HeroScene />
    </div>
  );
}