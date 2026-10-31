"use client";

import type { PartId } from "@/lib/animation/choreography";

/**
 * Component spotlights (brief 4.7).
 *
 * Deliberately plain HTML rather than text inside the WebGL canvas, so it is
 * selectable, translatable, screen-reader accessible and crisp at any DPR.
 * GSAP fades these in and out from the same master timeline that moves the
 * geometry, which is what keeps copy and hardware in sync.
 */

export interface Spotlight {
  readonly part: PartId;
  readonly heading: string;
  readonly body: string;
}

export const SPOTLIGHTS: readonly Spotlight[] = [
  {
    part: "COOLER",
    heading: "Cooling — performance under control",
    body: "Heat is the limit on sustained performance. The cooler moves thermal energy off the processor so clock speeds hold under load instead of throttling.",
  },
  {
    part: "CPU",
    heading: "CPU — the brain of your system",
    body: "Every instruction your games and applications run passes through here. Core count governs parallel work; clock speed governs how fast each core gets through it.",
  },
  {
    part: "RAM_01",
    heading: "RAM — speed and multitasking",
    body: "Working memory for everything currently running. Capacity decides how much stays loaded at once; speed decides how quickly the processor can reach it.",
  },
  {
    part: "GPU",
    heading: "GPU — power your gaming experience",
    body: "The single largest influence on frame rate and visual fidelity. It also sets your physical constraints: card length against case clearance, and power draw against the supply.",
  },
  {
    part: "SSD",
    heading: "SSD — fast storage for your games",
    body: "Solid-state storage with no moving parts. It determines how quickly games install, launch and stream assets as you play.",
  },
  {
    part: "PSU",
    heading: "PSU — powering every component",
    body: "Converts mains supply into the regulated rails every other part depends on. Headroom and the right connectors matter as much as the headline wattage.",
  },
  {
    part: "MOTHERBOARD",
    heading: "Motherboard — where everything connects",
    body: "The backplane that ties the system together. Its socket and memory generation decide which processors and memory kits will physically work at all.",
  },
] as const;

export function CinematicOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {SPOTLIGHTS.map((s) => (
        <article
          key={s.part}
          data-spotlight={s.part}
          className="absolute left-4 bottom-24 max-w-sm opacity-0 sm:left-10 sm:bottom-28 lg:max-w-md"
        >
          <div className="rounded-lg border border-line/80 bg-surface/80 p-5 backdrop-blur-md sm:p-6">
            <h2 className="text-balance text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
              {s.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

/**
 * Static, always-available version of the same content.
 *
 * Brief 16: the 3D scene is an enhancement, never the only place critical
 * information exists. Reduced-motion users and anyone without WebGL read this.
 */
export function SpotlightsAsText() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {SPOTLIGHTS.map((s) => (
        <article key={s.part} className="rounded-lg border border-line bg-surface p-6">
          <h3 className="text-lg font-semibold tracking-tight">{s.heading}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
        </article>
      ))}
    </div>
  );
}
