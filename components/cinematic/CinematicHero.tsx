"use client";

import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { ButtonLink } from "@/components/ui/Button";
import { FrameStage, type FrameStageHandle } from "./FrameStage";
import { useFrameSequence } from "./useFrameSequence";
import { frameForProgress } from "@/lib/animation/frames";

/**
 * Scroll-driven cinematic hero.
 *
 * Reuses the global Lenis instance mounted in the root layout — no second
 * instance is created here (brief 7.1).
 *
 * Desktop layout solves the portrait-source problem by NOT fighting it: the
 * 832x1108 render sits in a tall cinematic stage on the right, and the
 * resulting negative space on the left becomes the editorial typography
 * column. Stretching a portrait render across a 16:9 viewport would look
 * amateurish; giving it a column makes it look deliberate.
 */

const BEATS = [
  {
    id: "intro",
    heading: "Engineered to dominate.",
    body: "Every component. Every connection. Every detail. Built for performance.",
  },
  {
    id: "inside",
    heading: "Built from the inside out.",
    body: "A closer look at the hardware driving your next gaming machine.",
  },
  {
    id: "cta",
    heading: "Your machine. Your rules.",
    body: "Choose your parts. Shape your build. Start configuring.",
  },
] as const;

export function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<FrameStageHandle | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lastFrame = useRef(-1);
  const { ready, progress, failed, resolve } = useFrameSequence();
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleStageReady = useCallback(
    (handle: FrameStageHandle) => {
      stageRef.current = handle;
      handle.draw(resolve(1));
    },
    [resolve],
  );

  useGSAP(
    () => {
      if (!ready || !containerRef.current) return;

      const mm = gsap.matchMedia();

      // Reduced motion: no pinning, no scrubbing. One clean still, and every
      // message is rendered as ordinary stacked content below (brief 7.5, 16).
      mm.add("(prefers-reduced-motion: reduce)", () => {
        setReducedMotion(true);
        stageRef.current?.draw(resolve(1));
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        setReducedMotion(false);

        const st = ScrollTriggerFor(containerRef.current!, (p) => {
          const frame = frameForProgress(p);
          // Only repaint when the frame actually changes — scroll fires far
          // more often than 90 frames require.
          if (frame !== lastFrame.current) {
            lastFrame.current = frame;
            stageRef.current?.draw(resolve(frame));
          }
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${p})`;
          }
        });

        // Beat copy, cross-faded against the same scrubbed timeline.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        tl.set('[data-beat="intro"]', { opacity: 1, y: 0 })
          .to('[data-beat="intro"]', { opacity: 0, y: -24, duration: 0.18 }, 0.16)
          .fromTo('[data-beat="inside"]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.18 }, 0.3)
          .to('[data-beat="inside"]', { opacity: 0, y: -24, duration: 0.18 }, 0.6)
          .fromTo('[data-beat="cta"]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.2 }, 0.74);

        return () => st.kill();
      });
    },
    { scope: containerRef, dependencies: [ready, resolve] },
  );

  return (
    <>
      <div ref={containerRef} className="frame-scroll relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="mx-auto flex h-full max-w-7xl flex-col items-center gap-6 px-4 pt-20 pb-12 sm:px-6 lg:grid lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:items-center lg:gap-12 lg:px-10 lg:pt-16">
            {/* Typography column — the negative space the portrait render leaves */}
            <div className="relative order-2 min-h-[34vh] w-full lg:order-1 lg:h-[62vh]">
              {BEATS.map((beat, i) => (
                <div
                  key={beat.id}
                  data-beat={beat.id}
                  /* Absolutely stacked on EVERY breakpoint, not just lg.
                     Hiding beats on mobile would strand the CTA behind an
                     animation phone users never reach. */
                  className="absolute inset-x-0 top-0 lg:top-1/2 lg:-translate-y-1/2"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <h2 className="text-balance pb-1 text-[clamp(1.75rem,5.5vw,3.75rem)] font-semibold leading-[1.1] tracking-tight">
                    {beat.heading}
                  </h2>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
                    {beat.body}
                  </p>
                  {beat.id === "cta" ? (
                    <div className="mt-8">
                      <ButtonLink href="/configure">Start building</ButtonLink>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Cinematic stage — portrait render given a portrait home */}
            <div className="order-1 flex h-[46vh] w-full items-center justify-center lg:order-2 lg:h-[78vh]">
              <div className="relative h-full w-full">
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[90px]"
                />
                <FrameStage onReady={handleStageReady} className="relative" />
                {!ready && !failed ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="h-px w-32 overflow-hidden bg-line">
                      <div
                        className="h-full bg-accent transition-transform duration-200"
                        style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
                      />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
                      {Math.round(progress * 100)}%
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {!reducedMotion ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-5 hidden justify-center lg:flex">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
                Scroll to disassemble
              </span>
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line/50">
            <div ref={progressRef} className="h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>

      {/* Reduced motion / no-JS: the same copy as ordinary flow content. */}
      {reducedMotion ? (
        <section className="border-t border-line/60 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-10">
            {BEATS.map((beat) => (
              <div key={beat.id}>
                <h2 className="text-balance pb-1 text-2xl font-semibold leading-tight tracking-tight">
                  {beat.heading}
                </h2>
                <p className="mt-3 text-ink-muted">{beat.body}</p>
                {beat.id === "cta" ? (
                  <div className="mt-6">
                    <ButtonLink href="/configure">Start building</ButtonLink>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

/** Small helper so the scrub trigger reads clearly above. */
function ScrollTriggerFor(trigger: HTMLElement, onUpdate: (progress: number) => void) {
  return gsap.to(
    {},
    {
      scrollTrigger: {
        trigger,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        invalidateOnRefresh: true,
        onUpdate: (self) => onUpdate(self.progress),
      },
    },
  ).scrollTrigger!;
}
