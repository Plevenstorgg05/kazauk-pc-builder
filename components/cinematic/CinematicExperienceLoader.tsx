"use client";

import dynamic from "next/dynamic";

/**
 * Brief 13.4: next/dynamic with ssr:false must sit inside a Client Component.
 * Keeping it here means three.js never enters a Server Component's module
 * graph and nothing touches `window` during server rendering.
 */
const CinematicExperience = dynamic(
  () => import("./CinematicExperience").then((m) => m.CinematicExperience),
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

export function CinematicExperienceLoader() {
  return <CinematicExperience />;
}
