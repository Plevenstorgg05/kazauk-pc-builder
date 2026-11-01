import type { AnyPart, PcCase } from "@/lib/catalog/schema";
import type { RuleResult, Status } from "@/lib/compatibility/types";
import type { BuilderCategory } from "./categories";
export interface ProductImage {
  src: string;
  alt: string;
  sourceUrl: string;
  width?: number;
  height?: number;
}
export interface BuilderProduct {
  id: string;
  category: BuilderCategory;
  name: string;
  brand: string;
  model: string | null;
  price: number | null;
  stock: "listed" | "sold_out" | "unknown" | "n/a";
  sourceUrl: string | null;
  captured: string;
  origin: "original" | "researched";
  specs: { key: string; label: string; value: string }[];
  images: ProductImage[];
  imagePermission: string;
  imageVerification?: string;
  imageSourcePage?: string;
  note?: string;
  original?: AnyPart;
  caseSpecs?: PcCase;
}
export type BuilderSelection = Partial<Record<BuilderCategory, string>>;
export interface BuilderFinding extends Omit<RuleResult, "categories"> {
  categories: BuilderCategory[];
}
export interface BuilderEvaluation {
  results: BuilderFinding[];
  missing: BuilderCategory[];
  blocking: BuilderFinding[];
  advisories: BuilderFinding[];
  aggregate: Status | null;
  totalPence: number;
  unpriced: string[];
  covered: number;
  required: number;
  readiness: "incomplete" | "blocked" | "ready_with_ack" | "ready";
}
