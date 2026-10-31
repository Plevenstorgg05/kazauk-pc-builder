"use client";

import { ELECTRICAL_RULES } from "@/lib/compatibility/policy";
import type { RuleResult } from "@/lib/compatibility/types";
import { CompatibilityIndicator } from "./CompatibilityIndicator";

/**
 * Full explanation of one rule result.
 *
 * Shows the actual measurements the verdict used, never just "not compatible"
 * (brief 11.3, 11.8).
 */
export function CompatibilityDetails({ result }: { result: RuleResult }) {
  const electrical = ELECTRICAL_RULES.has(result.ruleId);
  return (
    <article className="rounded-lg border border-line bg-raised/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-ink">{result.title}</h4>
        <CompatibilityIndicator status={result.status} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{result.message}</p>

      {result.evidence ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line/70 pt-3 font-mono text-[11px] sm:grid-cols-3">
          {Object.entries(result.evidence).map(([k, v]) => (
            <div key={k}>
              <dt className="text-ink-faint">{k.replace(/([A-Z])/g, " $1").toLowerCase()}</dt>
              <dd className="text-ink-muted">{v === null || v === undefined ? "not published" : String(v)}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {result.action ? (
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          {electrical && result.status !== "compatible" ? (
            <strong className="text-status-caution">Do not build or purchase on this basis without verifying. </strong>
          ) : null}
          {result.action}
        </p>
      ) : null}
    </article>
  );
}
