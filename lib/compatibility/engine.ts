import { CATEGORIES, type Category } from "@/lib/catalog/schema";
import { findPart } from "@/lib/catalog/normalize";
import { sumPence } from "@/lib/pricing/currency";
import { buildContext, RULES } from "./rules";
import {
  DEFAULT_POLICY,
  STATUS_ORDER,
  type BuildEvaluation,
  type Policy,
  type Readiness,
  type RuleResult,
  type Selection,
  type Status,
} from "./types";

/**
 * Which categories a build must contain to be reviewable.
 *
 * Cooling is conditional: a processor that ships with a cooler satisfies it,
 * which is why it is not a flat requirement (brief 11.5.F).
 */
const REQUIRED: Category[] = ["cpu", "motherboard", "memory", "gpu", "case", "psu"];

/**
 * Evaluate a build.
 *
 * Pure: same inputs always give the same output, no React, no I/O, no clock.
 * That is what makes it testable without a browser (brief 11, 17.2).
 */
export function evaluateBuild(
  selection: Selection,
  policy: Policy = DEFAULT_POLICY,
): BuildEvaluation {
  const ctx = buildContext(selection, policy);

  const results: RuleResult[] = [];
  for (const rule of RULES) {
    const result = rule(ctx);
    // null means "inputs not selected yet" — not a failure.
    if (result) results.push(result);
  }

  const missing = REQUIRED.filter((c) => !selection[c]);
  // Cooling is required only when the processor does not include one.
  if (ctx.cpu && !ctx.cpu.cooler_included && !selection.cooler) {
    missing.push("cooler");
  }

  const blocking = results.filter((r) => r.status === "incompatible");
  const advisories = results.filter(
    (r) =>
      r.status === "warning" ||
      r.status === "needs_verification" ||
      r.status === "insufficient_data",
  );

  // Precedence is for the summary badge only. It never removes a finding from
  // `results` — every issue stays visible (brief 11.6).
  const aggregate: Status | null =
    results.length === 0
      ? null
      : (STATUS_ORDER.find((s) => results.some((r) => r.status === s)) ?? "compatible");

  const readiness: Readiness =
    missing.length > 0
      ? "incomplete"
      : blocking.length > 0
        ? "blocked"
        : advisories.length > 0
          ? "ready_with_ack"
          : "ready";

  const totalPence = sumPence(
    CATEGORIES.map((c) => selection[c])
      .filter((id): id is string => Boolean(id))
      .map((id) => findPart(id)?.price_gbp ?? 0),
  );

  return { results, missing, aggregate, blocking, advisories, readiness, totalPence };
}

/**
 * Evaluate one candidate part against the current build, for badging product
 * cards before selection. The candidate temporarily replaces its category.
 */
export function evaluateCandidate(
  selection: Selection,
  category: Category,
  partId: string,
  policy: Policy = DEFAULT_POLICY,
): { status: Status | null; reasons: RuleResult[] } {
  const hypothetical: Selection = { ...selection, [category]: partId };
  const { results } = evaluateBuild(hypothetical, policy);
  const relevant = results.filter((r) => r.partIds.includes(partId));
  if (relevant.length === 0) return { status: null, reasons: [] };
  const status = STATUS_ORDER.find((s) => relevant.some((r) => r.status === s)) ?? null;
  return { status, reasons: relevant.filter((r) => r.status !== "compatible") };
}
