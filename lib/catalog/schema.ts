import { z } from "zod";

/**
 * Schema for kazauk-am5-demo-parts.json.
 *
 * Deliberately strict about nullability. The dataset uses `null` to mean "not
 * published / not captured", and the single most dangerous bug in this project
 * would be a truthiness check that silently converts unknown into pass. Every
 * nullable field below is therefore `.nullable()` and never defaulted.
 */

export const StockSchema = z.enum(["listed", "sold_out", "unknown", "n/a"]);
export type Stock = z.infer<typeof StockSchema>;

const base = {
  id: z.string().min(1),
  name: z.string().min(1),
  price_gbp: z.number().nonnegative(),
  stock: StockSchema,
  url: z.string().nullable().optional(),
  source: z.string().optional(),
  demo_note: z.string().optional(),
};

export const CpuSchema = z.object({
  ...base,
  sku: z.string().nullable().optional(),
  socket: z.string(),
  memory_type: z.string(),
  cores: z.number().int().positive(),
  threads: z.number().int().positive(),
  tdp_w: z.number().positive(),
  has_igpu: z.boolean(),
  cooler_included: z.boolean(),
});

export const MotherboardSchema = z.object({
  ...base,
  socket: z.string(),
  chipset: z.string(),
  form_factor: z.string(),
  memory_type: z.string(),
  dimm_type: z.string(),
  memory_slots: z.number().int().nullable(),
});

export const MemorySchema = z.object({
  ...base,
  type: z.string(),
  dimm_type: z.string(),
  capacity_gb: z.number().positive(),
  modules: z.number().int().positive(),
  speed_mts: z.number().positive(),
});

export const GpuSchema = z.object({
  ...base,
  mpn: z.string().optional(),
  chipset: z.string(),
  length_mm: z.number().nullable(),
  height_mm: z.number().nullable(),
  thickness_mm: z.number().nullable(),
  board_power_w: z.number().nullable(),
  recommended_psu_w: z.number().nullable(),
  power_connectors: z.array(z.string()).nullable(),
});

export const CoolerSchema = z.object({
  ...base,
  type: z.enum(["air", "aio"]),
  sockets: z.array(z.string()).nullable(),
  height_mm: z.number().nullable().optional(),
  radiator_mm: z.number().nullable().optional(),
  radiator_thickness_mm: z.number().nullable().optional(),
  only_with_cpu: z.string().optional(),
});

export const PsuSchema = z.object({
  ...base,
  wattage: z.number().positive(),
  form_factor: z.string(),
  connectors: z.array(z.string()).nullable(),
});

/**
 * Case radiator support appears in THREE different shapes in the source data:
 *   [{ position, max_mm: 360 }]              - a stated maximum
 *   [{ position, sizes_mm: [240,280,360] }]  - an explicit list, no max_mm key
 *   null                                      - nothing published
 * All three are preserved here and unified in normalize.ts.
 */
export const RadiatorSchema = z.object({
  position: z.string(),
  max_mm: z.number().nullable().optional(),
  sizes_mm: z.array(z.number()).optional(),
});

export const CaseSchema = z.object({
  ...base,
  price_source: z.string().optional(),
  motherboard_support: z.array(z.string()),
  gpu_max_mm: z.number().nullable(),
  gpu_max_mm_conflict: z.array(z.number()).optional(),
  cooler_max_mm: z.number().nullable(),
  radiators: z.array(RadiatorSchema).nullable(),
  dimensions_mm: z.string().nullable(),
});

export const RuleSchema = z.object({
  id: z.string(),
  check: z.string(),
  fail: z.string().optional(),
  if_missing: z.string().optional(),
  if_conflict: z.string().optional(),
  note: z.string().optional(),
});

export const ScenarioSchema = z.object({
  name: z.string(),
  pick: z.array(z.string()),
  expect: z.string(),
});

export const CatalogSchema = z.object({
  meta: z.object({
    purpose: z.string(),
    captured: z.string(),
    platform: z.string(),
    states: z.array(z.string()),
    notes: z.array(z.string()),
  }),
  parts: z.object({
    cpu: z.array(CpuSchema),
    motherboard: z.array(MotherboardSchema),
    memory: z.array(MemorySchema),
    gpu: z.array(GpuSchema),
    cooler: z.array(CoolerSchema),
    psu: z.array(PsuSchema),
    case: z.array(CaseSchema),
  }),
  rules: z.array(RuleSchema),
  demo_scenarios: z.array(ScenarioSchema),
});

export type Cpu = z.infer<typeof CpuSchema>;
export type Motherboard = z.infer<typeof MotherboardSchema>;
export type Memory = z.infer<typeof MemorySchema>;
export type Gpu = z.infer<typeof GpuSchema>;
export type Cooler = z.infer<typeof CoolerSchema>;
export type Psu = z.infer<typeof PsuSchema>;
export type PcCase = z.infer<typeof CaseSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;

/** Internal category ids. `memory` is the source id; the UI labels it "RAM". */
export const CATEGORIES = [
  "cpu",
  "motherboard",
  "memory",
  "gpu",
  "case",
  "cooler",
  "psu",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  cpu: "Processor",
  motherboard: "Motherboard",
  memory: "Memory",
  gpu: "Graphics card",
  case: "Case",
  cooler: "CPU cooler",
  psu: "Power supply",
};

export type AnyPart = Cpu | Motherboard | Memory | Gpu | Cooler | Psu | PcCase;
