import raw from "@/data/kazauk-am5-demo-parts.json";
import {
  CatalogSchema,
  type AnyPart,
  type Catalog,
  type Category,
  type PcCase,
} from "./schema";

/**
 * Parse and validate the source catalogue exactly once, at module scope.
 *
 * A schema failure throws at import time rather than producing a half-broken
 * configurator at runtime (brief 10.4).
 */
export const CATALOG: Catalog = CatalogSchema.parse(raw);

/** Every part, indexed by id, with the category it came from. */
const INDEX = new Map<string, { category: Category; part: AnyPart }>();
for (const [category, list] of Object.entries(CATALOG.parts)) {
  for (const part of list) {
    INDEX.set(part.id, { category: category as Category, part: part as AnyPart });
  }
}

export function findPart(id: string): AnyPart | undefined {
  return INDEX.get(id)?.part;
}
export function categoryOf(id: string): Category | undefined {
  return INDEX.get(id)?.category;
}
export function partsIn<T extends Category>(category: T) {
  return CATALOG.parts[category];
}

/**
 * Unified radiator support for a case.
 *
 * The source data expresses this three different ways, and the JSON's own rule
 * text ("max of case.radiators[].max_mm") is undefined for two of them:
 *
 *   max_mm: 360                  -> a stated maximum
 *   sizes_mm: [240, 280, 360]    -> an explicit list, no max_mm key at all
 *   radiators: null              -> nothing published
 *
 * The distinction that matters for rule I is between a CONFIRMED supported
 * size and an UNKNOWN limit — those are different answers, not the same one
 * (brief 11.5.I).
 */
export interface RadiatorSupport {
  /** Largest radiator the case is known to accept, if any figure is published. */
  maxMm: number | null;
  /** Explicitly listed sizes, where the source enumerates them. */
  listedSizes: number[];
  /** True when the case publishes no usable radiator information at all. */
  unknown: boolean;
}

export function radiatorSupport(pcCase: PcCase): RadiatorSupport {
  if (!pcCase.radiators || pcCase.radiators.length === 0) {
    return { maxMm: null, listedSizes: [], unknown: true };
  }
  const maxima: number[] = [];
  const listed: number[] = [];
  for (const r of pcCase.radiators) {
    if (typeof r.max_mm === "number") maxima.push(r.max_mm);
    if (r.sizes_mm) listed.push(...r.sizes_mm);
  }
  const all = [...maxima, ...listed];
  return {
    maxMm: all.length > 0 ? Math.max(...all) : null,
    listedSizes: [...new Set(listed)].sort((a, b) => a - b),
    unknown: all.length === 0,
  };
}

/**
 * Usable GPU clearance for a case.
 *
 * `gpu_max_mm_conflict` records sources that disagree. We compare against the
 * LOWEST conflicting value to stay safe, but never discard the conflict — the
 * result must still surface as needs_verification (brief 11.5.E).
 */
export interface GpuClearance {
  limitMm: number | null;
  conflicting: number[] | null;
  unknown: boolean;
}

export function gpuClearance(pcCase: PcCase): GpuClearance {
  if (pcCase.gpu_max_mm_conflict && pcCase.gpu_max_mm_conflict.length > 0) {
    return {
      limitMm: Math.min(...pcCase.gpu_max_mm_conflict),
      conflicting: [...pcCase.gpu_max_mm_conflict].sort((a, b) => a - b),
      unknown: false,
    };
  }
  if (typeof pcCase.gpu_max_mm === "number") {
    return { limitMm: pcCase.gpu_max_mm, conflicting: null, unknown: false };
  }
  return { limitMm: null, conflicting: null, unknown: true };
}

/** Human-readable stock label. Never conflated with compatibility (brief 10.3). */
export const STOCK_LABELS: Record<string, string> = {
  listed: "Listed",
  sold_out: "Sold out",
  unknown: "Availability unknown",
  "n/a": "Included",
};
