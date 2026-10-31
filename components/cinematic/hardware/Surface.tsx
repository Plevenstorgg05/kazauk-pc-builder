"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSurfaces } from "./textures";
import { MAT } from "./materials";

type Surfaces = ReturnType<typeof useSurfaces>;
const SurfaceCtx = createContext<Surfaces | null>(null);

export function SurfaceProvider({ children }: { children: ReactNode }) {
  const surfaces = useSurfaces();
  return <SurfaceCtx.Provider value={surfaces}>{children}</SurfaceCtx.Provider>;
}

/** Which PBR set backs each named material. */
const TEXTURE_FOR: Partial<Record<keyof typeof MAT, keyof Surfaces>> = {
  chassis: "plate",
  aluminium: "brushed",
  anodised: "brushed",
  fin: "brushed",
  copper: "brushed",
  ihs: "brushed",
  pcb: "plastic",
  pcbDark: "plastic",
  plastic: "plastic",
};

/** How strongly the normal map perturbs each surface. */
const NORMAL_STRENGTH: Partial<Record<keyof typeof MAT, number>> = {
  chassis: 0.85,
  plastic: 0.75,
  pcb: 0.6,
  pcbDark: 0.6,
  anodised: 0.55,
  aluminium: 0.45,
  fin: 0.35,
  copper: 0.4,
  ihs: 0.25,
};

/**
 * A textured material.
 *
 * Replaces bare `<meshStandardMaterial {...MAT.x} />`. The base colour and
 * metalness/roughness still come from MAT, but albedo, normal and roughness
 * maps are layered on top — which is what stops a flat surface reading as
 * untextured CG.
 */
export function Mat({
  kind,
  ...overrides
}: { kind: keyof typeof MAT } & Record<string, unknown>) {
  const surfaces = useContext(SurfaceCtx);
  const base = MAT[kind];
  const setName = TEXTURE_FOR[kind];
  const maps = surfaces && setName ? surfaces[setName] : null;
  const strength = NORMAL_STRENGTH[kind] ?? 0.5;

  return (
    <meshStandardMaterial
      {...base}
      {...(maps ?? {})}
      {...(maps ? { normalScale: [strength, strength] as unknown as undefined } : {})}
      {...overrides}
    />
  );
}
