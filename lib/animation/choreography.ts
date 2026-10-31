/**
 * Choreography data for the cinematic disassembly (brief 5.3, 8.1).
 *
 * Everything the animation needs lives here as typed data, NOT as magic numbers
 * scattered through JSX. When the real GLB replaces the proxy geometry, only the
 * `size` fields and the node-name mapping change — positions, explode vectors,
 * ordering and timing all survive.
 *
 * Scale: 1 unit = 100 mm. The proxy is sized from real ATX hardware dimensions
 * so the spatial relationships are already honest.
 * Axes: +X points out through the glass side panel, +Y up, +Z toward the front.
 */

export const PART_IDS = [
  "CASE_CHASSIS",
  "CASE_GLASS_PANEL",
  "MOTHERBOARD",
  "CPU",
  "COOLER",
  "RAM_01",
  "RAM_02",
  "GPU",
  "SSD",
  "PSU",
] as const;

export type PartId = (typeof PART_IDS)[number];

export type Vec3 = readonly [number, number, number];

export interface PartSpec {
  readonly id: PartId;
  /** Box dimensions in units (1 unit = 100 mm), derived from real hardware. */
  readonly size: Vec3;
  /** Position in the fully assembled PC. This is the canonical "home". */
  readonly assembled: Vec3;
  /** Position in the fully exploded arrangement. */
  readonly exploded: Vec3;
  /**
   * Rotation (radians) in the exploded arrangement. Parts that tumble slightly
   * as they withdraw read as physical objects rather than sliding decals —
   * this is most of the difference between "technical" and "satisfying".
   */
  readonly explodedRotation?: Vec3;
  readonly color: string;
  /** Emissive strength, used sparingly for the RGB-lit parts. */
  readonly emissive?: string;
  readonly metalness?: number;
  readonly roughness?: number;
  /** Transparent parts (the tempered glass) render last and cast no shadow. */
  readonly glass?: boolean;
}

/**
 * Removal directions follow real mechanics (brief 4.6):
 * - PCIe cards and DIMMs withdraw along the board normal (+X)
 * - the cooler lifts off the CPU before the CPU leaves its socket
 * - the PSU slides out of its basement toward the rear (-Z)
 * - the motherboard separates last, once everything mounted on it has cleared
 */
export const PARTS: readonly PartSpec[] = [
  {
    id: "CASE_CHASSIS",
    size: [2.2, 4.4, 4.2],
    assembled: [0, 0, 0],
    exploded: [-3.8, 0, 0],
    explodedRotation: [0, 0.14, 0],
    color: "#2a2e33",
    metalness: 0.45,
    roughness: 0.55,
  },
  {
    id: "CASE_GLASS_PANEL",
    size: [0.05, 4.2, 4.0],
    assembled: [1.08, 0, 0],
    exploded: [8.0, 1.3, 0.9],
    explodedRotation: [0, -0.24, 0.12],
    color: "#8fb7d9",
    metalness: 0.1,
    roughness: 0.05,
    glass: true,
  },
  {
    id: "MOTHERBOARD",
    size: [0.20, 3.0, 2.4],
    assembled: [-0.62, 0.45, -0.1],
    exploded: [1.1, 0.9, -0.1],
    explodedRotation: [0, 0.18, 0.04],
    color: "#1f3a2e",
    metalness: 0.2,
    roughness: 0.7,
  },
  {
    id: "CPU",
    size: [0.08, 0.45, 0.45],
    assembled: [-0.48, 1.0, 0.1],
    exploded: [2.9, 3.0, 0.2],
    explodedRotation: [0.5, 0.8, 0.3],
    color: "#c8ccd0",
    metalness: 0.85,
    roughness: 0.25,
  },
  {
    // x moved to -0.02 so the cooler SITS ON the CPU face instead of through it.
    id: "COOLER",
    size: [1.0, 1.2, 1.0],
    assembled: [0.06, 1.0, -0.1],
    exploded: [4.8, 1.8, 0.1],
    explodedRotation: [0.18, -0.5, 0.1],
    color: "#44494f",
    emissive: "#2a6ed8",
    metalness: 0.7,
    roughness: 0.35,
  },
  {
    // Thinner (0.28) and pushed clear of the cooler in Z; the two sticks no
    // longer occupy the same space as each other.
    id: "RAM_01",
    size: [0.1, 1.2, 0.28],
    assembled: [-0.47, 1.05, 0.62],
    exploded: [2.7, 2.7, 1.7],
    explodedRotation: [0, -0.3, 0.38],
    color: "#3a3f45",
    emissive: "#b03a9a",
    metalness: 0.5,
    roughness: 0.4,
  },
  {
    id: "RAM_02",
    size: [0.1, 1.2, 0.28],
    assembled: [-0.47, 1.05, 0.95],
    exploded: [2.7, 2.7, 2.4],
    explodedRotation: [0, -0.3, 0.38],
    color: "#3a3f45",
    emissive: "#b03a9a",
    metalness: 0.5,
    roughness: 0.4,
  },
  {
    // x moved to 0.15 so the card clears the motherboard PCB.
    id: "GPU",
    size: [1.45, 0.65, 3.0],
    assembled: [0.22, -0.35, -0.2],
    exploded: [4.9, -1.2, -0.2],
    explodedRotation: [0.1, -0.3, 0.05],
    color: "#2f343a",
    emissive: "#1f6feb",
    metalness: 0.75,
    roughness: 0.3,
  },
  {
    // Raised to y 0.3: an M.2 above the primary PCIe slot, not buried in the GPU.
    id: "SSD",
    size: [0.06, 0.22, 0.8],
    assembled: [-0.49, 0.3, -0.55],
    exploded: [1.9, -2.3, 1.8],
    explodedRotation: [0.3, -0.6, 0.9],
    color: "#6f7681",
    metalness: 0.6,
    roughness: 0.35,
  },
  {
    id: "PSU",
    size: [1.5, 0.86, 1.4],
    assembled: [-0.1, -1.65, -1.2],
    exploded: [3.4, -3.7, -2.7],
    explodedRotation: [0.1, 0.35, 0],
    color: "#25292e",
    metalness: 0.6,
    roughness: 0.45,
  },
] as const;

/**
 * Two-phase extraction (brief 4.6).
 *
 * A part that tweens straight from its socket to a scattered exploded position
 * travels DIAGONALLY, which sends it through the chassis ceiling and side on the
 * way out. So every internal part first withdraws along +X — the direction it
 * genuinely unplugs in, now that the glass panel is off — to this staging plane,
 * and only then fans out to its final position. Fixes the clipping and reads as
 * real disassembly rather than parts dissolving through metal.
 */
export const STAGING_X = 2.3;

/** Parts extracted through the open side panel before fanning out. */
export const STAGED_PARTS: readonly PartId[] = [
  "CASE_GLASS_PANEL",
  "COOLER",
  "CPU",
  "RAM_01",
  "RAM_02",
  "GPU",
  "SSD",
  "PSU",
];

export const PART_BY_ID: Readonly<Record<PartId, PartSpec>> = Object.fromEntries(
  PARTS.map((p) => [p.id, p]),
) as Record<PartId, PartSpec>;

/** Camera poses per stage (brief 8.2). `target` is the look-at point. */
export interface CameraPose {
  readonly position: Vec3;
  readonly target: Vec3;
}

export const CAMERA_POSES = {
  hero: { position: [6.2, 2.4, 7.6], target: [0, 0.1, 0] },
  approach: { position: [4.6, 1.6, 5.4], target: [0, 0.2, 0] },
  interior: { position: [3.4, 1.3, 3.2], target: [-0.3, 0.5, 0] },
  spotlight: { position: [3.9, 1.6, 3.0], target: [0.2, 0.7, 0.2] },
  exploded: { position: [9.6, 3.2, 10.4], target: [0.7, 0.1, 0] },
  explodedOrbit: { position: [-6.0, 4.4, 12.2], target: [0.7, 0.1, 0] },
  final: { position: [6.2, 2.4, 7.6], target: [0, 0.1, 0] },
} as const satisfies Record<string, CameraPose>;

/**
 * Timeline labels (brief 8.1). Durations are relative weights, not seconds:
 * ScrollTrigger scrub maps the whole timeline onto the pinned scroll distance,
 * so these describe PACING rather than absolute time.
 */
export const STAGES = [
  { label: "hero", duration: 0.9 },
  { label: "approach", duration: 1.3 },
  { label: "openCase", duration: 1.6 },
  { label: "inspectInterior", duration: 1.1 },
  { label: "removeCooler", duration: 1.1 },
  { label: "removeCPU", duration: 1.0 },
  { label: "removeRAM", duration: 1.0 },
  { label: "removeGPU", duration: 1.3 },
  { label: "removeSSD", duration: 0.9 },
  { label: "removePSU", duration: 1.0 },
  { label: "removeMotherboard", duration: 1.0 },
  { label: "fullExploded", duration: 2.4 },
  { label: "reassemble", duration: 2.8 },
  { label: "closeCase", duration: 1.2 },
  { label: "finalReveal", duration: 1.4 },
] as const;

export type StageLabel = (typeof STAGES)[number]["label"];

/** Total scroll distance for the pinned sequence, in viewport heights (brief 8.3). */
export const SCROLL_VH_DESKTOP = 1400;
export const SCROLL_VH_MOBILE = 800;
