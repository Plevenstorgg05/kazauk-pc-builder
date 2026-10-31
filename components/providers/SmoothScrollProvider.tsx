"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap/register";

/**
 * The single global Lenis instance for the entire application (brief 7.1).
 *
 * Deliberate choices:
 * - Mounted once in the root layout, so navigating between / and /configure
 *   does NOT create a second instance.
 * - autoRaf: false, because Lenis and GSAP must share one requestAnimationFrame
 *   loop. Two independent loops produce visible scroll jitter.
 * - gsap.ticker reports seconds; Lenis expects milliseconds, hence time * 1000.
 * - lagSmoothing(0) stops GSAP from fabricating catch-up frames after a stall,
 *   which would otherwise desynchronise scrubbed ScrollTriggers.
 * - Reduced-motion users get native scrolling: Lenis is never constructed.
 *
 * This is a plain effect, not useGSAP, because it manages a non-GSAP resource
 * lifecycle rather than creating animations (explicitly permitted by brief 7.2).
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({ autoRaf: false });

    const handleScroll = () => ScrollTrigger.update();
    lenis.on("scroll", handleScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Full teardown: survives React Strict Mode's double mount in development.
    return () => {
      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
