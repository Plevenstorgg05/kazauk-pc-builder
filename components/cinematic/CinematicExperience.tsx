"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import type { PerspectiveCamera as ThreePerspectiveCamera } from "three";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { CinematicScene } from "./CinematicScene";
import { CinematicOverlay } from "./CinematicOverlay";
import type { PartRegistry } from "./PCModel";
import {
  CAMERA_POSES,
  PART_BY_ID,
  PARTS,
  SCROLL_VH_DESKTOP,
  STAGED_PARTS,
  STAGES,
  STAGING_X,
  type CameraPose,
  type PartId,
} from "@/lib/animation/choreography";

/** Parts leave the chassis in mechanically plausible order (brief 4.6). */
const REMOVAL_SEQUENCE: readonly { stage: string; parts: readonly PartId[] }[] = [
  { stage: "removeCooler", parts: ["COOLER"] },
  { stage: "removeCPU", parts: ["CPU"] },
  { stage: "removeRAM", parts: ["RAM_01", "RAM_02"] },
  { stage: "removeGPU", parts: ["GPU"] },
  { stage: "removeSSD", parts: ["SSD"] },
  { stage: "removePSU", parts: ["PSU"] },
  { stage: "removeMotherboard", parts: ["MOTHERBOARD", "CASE_CHASSIS"] },
];

export function CinematicExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const registry = useMemo<PartRegistry>(() => new Map(), []);
  const target = useMemo(() => new Vector3(...CAMERA_POSES.hero.target), []);
  const [ready, setReady] = useState(false);

  const handleReady = useCallback(() => setReady(true), []);

  useGSAP(
    () => {
      if (!ready || !containerRef.current || !cameraRef.current) return;

      const camera = cameraRef.current;
      const mm = gsap.matchMedia();

      // Reduced motion (brief 7.5): one static exploded pose, no scrubbing.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        camera.position.set(...CAMERA_POSES.exploded.position);
        target.set(...CAMERA_POSES.exploded.target);
        for (const spec of PARTS) {
          const group = registry.get(spec.id);
          if (!group) continue;
          group.position.set(...spec.exploded);
          if (spec.explodedRotation) group.rotation.set(...spec.explodedRotation);
        }
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${self.progress})`;
              }
            },
          },
        });

        // Named labels first, so tweens are positioned by name rather than by a
        // pile of hand-tuned offsets (brief 8.1).
        let t = 0;
        for (const stage of STAGES) {
          tl.addLabel(stage.label, t);
          t += stage.duration;
        }
        tl.addLabel("end", t);

        const moveCamera = (pose: CameraPose, at: string, duration: number, ease = "power2.inOut") => {
          tl.to(camera.position, { ...vec(pose.position), duration, ease }, at);
          tl.to(target, { ...vec(pose.target), duration, ease }, at);
        };

        // ---- Approach ---------------------------------------------------------
        moveCamera(CAMERA_POSES.approach, "approach", 1.3);
        tl.to("[data-hero]", { opacity: 0, y: -30, duration: 0.7 }, "approach");

        // ---- Glass panel ------------------------------------------------------
        animatePart("CASE_GLASS_PANEL", "exploded", "openCase", 1.6, "power3.inOut");
        moveCamera(CAMERA_POSES.interior, "openCase", 1.6);
        moveCamera(CAMERA_POSES.spotlight, "inspectInterior", 1.1);

        // ---- Disassembly ------------------------------------------------------
        for (const step of REMOVAL_SEQUENCE) {
          step.parts.forEach((id, i) => {
            // power3.in starts slow and accelerates: parts look like they are
            // being pulled free rather than gliding on rails.
            animatePart(id, "exploded", `${step.stage}+=${i * 0.14}`, 0.95, "power3.inOut");
          });

          const spotlightPart = step.parts[0];
          if (spotlightPart) {
            tl.fromTo(
              `[data-spotlight="${spotlightPart}"]`,
              { opacity: 0, y: 28, filter: "blur(6px)" },
              { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.34, ease: "power2.out" },
              step.stage,
            ).to(
              `[data-spotlight="${spotlightPart}"]`,
              { opacity: 0, y: -18, filter: "blur(6px)", duration: 0.28, ease: "power2.in" },
              `${step.stage}+=0.74`,
            );
          }
        }

        // ---- Payoff: hold the exploded view and orbit it slowly ---------------
        moveCamera(CAMERA_POSES.exploded, "fullExploded", 1.2);
        // A slow drift across the exploded arrangement. Parallax between the
        // scattered parts is what sells the depth — a static hold reads flat.
        moveCamera(CAMERA_POSES.explodedOrbit, "fullExploded+=1.2", 1.2, "sine.inOut");

        // ---- Reassembly: forward motion, reverse removal order (brief 4.9) ----
        const reassembleOrder = [...REMOVAL_SEQUENCE].reverse();
        reassembleOrder.forEach((step, stepIndex) => {
          step.parts.forEach((id, i) => {
            // back.out gives a small overshoot and settle — the "click into
            // place" that makes reassembly feel mechanical and satisfying.
            animatePart(
              id,
              "assembled",
              `reassemble+=${stepIndex * 0.3 + i * 0.1}`,
              0.72,
              // NOT back.out: an overshooting ease drives the part PAST its
              // socket and into the chassis wall before settling. The springy
              // feel is applied on the staging leg instead, out in open air
              // where overshoot cannot intersect anything.
              "power3.out",
            );
          });
        });

        moveCamera(CAMERA_POSES.final, "reassemble+=1.6", 1.8);
        animatePart("CASE_GLASS_PANEL", "assembled", "closeCase", 1.1, "power3.inOut");

        /**
         * Tween one part to either its assembled or exploded transform.
         *
         * Staged parts move in two legs so they never cut a diagonal through
         * the chassis: outward along +X to the staging plane, then to the final
         * position (and the exact reverse when reassembling).
         */
        function animatePart(
          id: PartId,
          to: "assembled" | "exploded",
          at: string,
          duration: number,
          ease: string,
        ) {
          const group = registry.get(id);
          if (!group) return;
          const spec = PART_BY_ID[id];
          const dest = to === "exploded" ? spec.exploded : spec.assembled;
          const rot = to === "exploded" ? (spec.explodedRotation ?? [0, 0, 0]) : [0, 0, 0];
          const staged = STAGED_PARTS.includes(id);

          if (!staged) {
            tl.to(group.position, { ...vec(dest), duration, ease }, at);
            if (spec.explodedRotation) {
              tl.to(group.rotation, { x: rot[0], y: rot[1], z: rot[2], duration, ease }, at);
            }
            return;
          }

          const legA = duration * 0.45;
          const legB = duration * 0.55;

          if (to === "exploded") {
            // Leg 1: straight out of the socket, holding its mounted Y and Z.
            const staging = [STAGING_X, spec.assembled[1], spec.assembled[2]] as const;
            tl.to(group.position, { ...vec(staging), duration: legA, ease: "power2.in" }, at);
            // Leg 2: fan into the exploded arrangement, rotating as it travels.
            tl.to(group.position, { ...vec(dest), duration: legB, ease }, `${at}+=${legA}`);
            if (spec.explodedRotation) {
              tl.to(
                group.rotation,
                { x: rot[0], y: rot[1], z: rot[2], duration: legB, ease },
                `${at}+=${legA}`,
              );
            }
          } else {
            // Reassembly is the same path walked backwards: return to the
            // staging plane square-on, then insert along the socket axis.
            const staging = [STAGING_X, spec.assembled[1], spec.assembled[2]] as const;
            // Overshoot lives HERE, in free space: the part springs back toward
            // the case, squares up, then inserts cleanly.
            tl.to(group.position, { ...vec(staging), duration: legA, ease: "back.out(1.6)" }, at);
            if (spec.explodedRotation) {
              tl.to(group.rotation, { x: 0, y: 0, z: 0, duration: legA, ease: "power2.inOut" }, at);
            }
            tl.to(group.position, { ...vec(dest), duration: legB, ease }, `${at}+=${legA}`);
          }
        }

        function vec(v: readonly [number, number, number]) {
          return { x: v[0], y: v[1], z: v[2] };
        }
      });
    },
    { scope: containerRef, dependencies: [ready, registry, target] },
  );

  return (
    <div
      ref={containerRef}
      style={{ height: `${SCROLL_VH_DESKTOP}vh` }}
      className="relative"
      data-cinematic-root
    >
      {/* CSS sticky rather than ScrollTrigger pin: no pin-spacer layout, better
          Lenis cooperation, and structurally impossible to animate the pinned
          element itself (brief 7.3). */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas
          dpr={[1, 2]}
          shadows
          gl={{ antialias: true }}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <CinematicScene
            registry={registry}
            cameraRef={cameraRef}
            target={target}
            onReady={handleReady}
          />
        </Canvas>

        <div data-hero className="pointer-events-none absolute inset-0 z-10 flex items-center">
          <div className="w-full px-4 sm:px-10 lg:px-16">
            <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Engineered to perform.
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-muted">
              Explore the technology behind your next gaming PC.
            </p>
          </div>
        </div>

        <CinematicOverlay />

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
            Scroll to disassemble
          </span>
        </div>

        {/* Scroll progress. Scaled via transform in a ScrollTrigger onUpdate —
            no React state touches the scroll frame (brief 7.4). */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line/50">
          <div
            ref={progressRef}
            className="h-full origin-left bg-accent"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
