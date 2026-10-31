import type { Category } from "@/lib/catalog/schema";

/**
 * The five compatibility states from the dataset (brief 11.1).
 *
 * These are never collapsed into a generic pass/fail. The distinction between
 * "we checked and it fails" and "we cannot tell" is the entire point of the
 * engine.
 */
export type Status =
  | "compatible"        // evidence confirms this specific check passes
  | "incompatible"      // known information establishes a failure
  | "needs_verification" // sources conflict, or a known uncertainty exists
  | "insufficient_data" // a required spec is missing; no confident conclusion
  | "warning";          // advisory risk, not a hard incompatibility

export const STATUS_ORDER: Status[] = [
  "incompatible",
  "needs_verification",
  "insufficient_data",
  "warning",
  "compatible",
];

/** Completion is tracked separately from compatibility (brief 11.2). */
export type Readiness = "incomplete" | "blocked" | "ready_with_ack" | "ready";

export interface RuleResult {
  ruleId: string;
  title: string;
  status: Status;
  /** Plain-English explanation including the actual measurements used. */
  message: string;
  categories: Category[];
  partIds: string[];
  /** The figures the verdict was based on, for transparency (brief 11.3). */
  evidence?: Record<string, string | number | null | undefined>;
  /** What is missing, when the status is insufficient_data. */
  missing?: string[];
  /** What the user can do about it. */
  action?: string;
}

export type Selection = Partial<Record<Category, string>>;

export interface BuildEvaluation {
  /** Every rule that had enough inputs to run. Nothing is discarded. */
  results: RuleResult[];
  /** Categories with no selection yet — NOT a compatibility failure. */
  missing: Category[];
  /** Highest-precedence status across all results, for a summary badge. */
  aggregate: Status | null;
  blocking: RuleResult[];
  advisories: RuleResult[];
  readiness: Readiness;
  /** Total of selected parts, in integer pence. */
  totalPence: number;
}

/** Tunable inputs to the PSU headroom estimate (brief 11.5.K). */
export interface Policy {
  /** Allowance for everything that is not the CPU or GPU, in watts. */
  systemOverheadW: number;
  /** Safety multiplier applied to the estimated load. */
  headroomMultiplier: number;
}

/**
 * The JSON uses (CPU TDP + GPU board power + 100) * 1.3.
 *
 * Both numbers are explicitly placeholders in the source data, not an
 * electrical engineering standard, so they live here as configuration and the
 * UI states that they are provisional. TDP is also not a worst-case power
 * figure — transient spikes on modern GPUs can exceed it substantially.
 */
export const DEFAULT_POLICY: Policy = {
  systemOverheadW: 100,
  headroomMultiplier: 1.3,
};
