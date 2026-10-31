"use client";

import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { RepeatWrapping, SRGBColorSpace, type Texture } from "three";

/**
 * CC0 PBR texture sets from ambientCG (see public/textures/CREDITS.json).
 *
 * This is the single biggest realism lever available for free. Flat-shaded
 * colour reads as CG no matter how good the geometry is, because real surfaces
 * carry micro-detail: brushing direction on aluminium, moulding grain on
 * plastic, the subtle orange-peel of powder coat. A normal + roughness map
 * supplies all of that for ~30KB per material.
 *
 * Downscaled to 512px and JPEG-compressed: 9 maps, 260KB total.
 */
export type SurfaceSet = {
  map: Texture;
  normalMap: Texture;
  roughnessMap: Texture;
};

function configure(set: SurfaceSet, repeat: number): SurfaceSet {
  for (const [key, t] of Object.entries(set)) {
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.repeat.set(repeat, repeat);
    // Only the albedo is colour data; normal and roughness are linear.
    if (key === "map") t.colorSpace = SRGBColorSpace;
    t.needsUpdate = true;
  }
  return set;
}

export function useSurfaces() {
  const brushed = useTexture({
    map: "/textures/brushed_color.jpg",
    normalMap: "/textures/brushed_normal.jpg",
    roughnessMap: "/textures/brushed_rough.jpg",
  }) as SurfaceSet;

  const plate = useTexture({
    map: "/textures/plate_color.jpg",
    normalMap: "/textures/plate_normal.jpg",
    roughnessMap: "/textures/plate_rough.jpg",
  }) as SurfaceSet;

  const plastic = useTexture({
    map: "/textures/plastic_color.jpg",
    normalMap: "/textures/plastic_normal.jpg",
    roughnessMap: "/textures/plastic_rough.jpg",
  }) as SurfaceSet;

  return useMemo(
    () => ({
      brushed: configure(brushed, 3),
      plate: configure(plate, 2),
      plastic: configure(plastic, 4),
    }),
    [brushed, plate, plastic],
  );
}

/** Preload so textures are ready before the first frame of the scroll. */
useTexture.preload([
  "/textures/brushed_color.jpg",
  "/textures/brushed_normal.jpg",
  "/textures/brushed_rough.jpg",
  "/textures/plate_color.jpg",
  "/textures/plate_normal.jpg",
  "/textures/plate_rough.jpg",
  "/textures/plastic_color.jpg",
  "/textures/plastic_normal.jpg",
  "/textures/plastic_rough.jpg",
]);
