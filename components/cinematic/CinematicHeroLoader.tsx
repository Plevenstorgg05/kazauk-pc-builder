"use client";

import dynamic from "next/dynamic";

/**
 * Brief 13.4: next/dynamic with ssr:false must sit inside a Client Component.
 * The canvas renderer touches window and devicePixelRatio, so it must not run
 * during server rendering.
 */
const CinematicHero = dynamic(
  () => import("./CinematicHero").then((m) => m.CinematicHero),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-faint">
          Preparing experience
        </span>
      </div>
    ),
  },
);

export function CinematicHeroLoader() {
  return <CinematicHero />;
}
