"use client";

import { Suspense, useLayoutEffect, useRef } from "react";
import type { Group } from "three";
import { PARTS, type PartId, type PartSpec } from "@/lib/animation/choreography";
import { Chassis, GlassPanel } from "./hardware/Case";
import { Motherboard, Cpu, RamStick, Ssd } from "./hardware/Board";
import { Gpu, Cooler, Psu } from "./hardware/Cards";
import { RGB } from "./hardware/materials";
import { SurfaceProvider } from "./hardware/Surface";

export type PartRegistry = Map<PartId, Group>;

/**
 * The PC, built procedurally from the choreography spec.
 *
 * Why generated rather than imported: we own the licence outright, the
 * hierarchy and pivots are correct by construction (brief 6.4), the payload is
 * kilobytes instead of tens of megabytes, and art direction is a number change
 * rather than a Blender session.
 *
 * Each part is wrapped in its own <group> and registered by stable id; GSAP
 * animates THE GROUP, never the meshes, so local transforms stay intact
 * (brief 5.3).
 */
function PartGeometry({ id }: { id: PartId }) {
  switch (id) {
    case "CASE_CHASSIS": return <Chassis />;
    case "CASE_GLASS_PANEL": return <GlassPanel />;
    case "MOTHERBOARD": return <Motherboard />;
    case "CPU": return <Cpu />;
    case "COOLER": return <Cooler />;
    case "RAM_01": return <RamStick color={RGB.bright} />;
    case "RAM_02": return <RamStick color={RGB.bright} />;
    case "GPU": return <Gpu />;
    case "SSD": return <Ssd />;
    case "PSU": return <Psu />;
  }
}

function Part({
  spec,
  register,
}: {
  spec: PartSpec;
  register: (id: PartId, group: Group) => void;
}) {
  const ref = useRef<Group>(null);
  useLayoutEffect(() => {
    if (ref.current) register(spec.id, ref.current);
  }, [register, spec.id]);

  return (
    <group ref={ref} name={spec.id} position={spec.assembled as [number, number, number]}>
      <PartGeometry id={spec.id} />
    </group>
  );
}

export function PCModel({
  registry,
  onReady,
}: {
  registry: PartRegistry;
  onReady: () => void;
}) {
  const register = (id: PartId, group: Group) => {
    registry.set(id, group);
    if (registry.size === PARTS.length) onReady();
  };

  return (
    /*
      SurfaceProvider loads the CC0 PBR texture sets once and shares them with
      every material. useTexture suspends while they download, so the Suspense
      boundary is mandatory - without it React throws inside the Canvas and the
      whole scene fails to mount.

      fallback={null} is deliberate: the surrounding page already shows a
      loading state, and rendering untextured geometry for a few frames would
      read as a visual pop.
    */
    <Suspense fallback={null}>
      <SurfaceProvider>
        <group>
          {PARTS.map((spec) => (
            <Part key={spec.id} spec={spec} register={register} />
          ))}
        </group>
      </SurfaceProvider>
    </Suspense>
  );
}
