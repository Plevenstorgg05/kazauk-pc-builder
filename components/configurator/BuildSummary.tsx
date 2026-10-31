"use client";

import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/catalog/schema";
import { findPart, STOCK_LABELS } from "@/lib/catalog/normalize";
import { formatPence, formatPounds } from "@/lib/pricing/currency";
import { READINESS_COPY } from "@/lib/compatibility/policy";
import type { BuildEvaluation, Selection } from "@/lib/compatibility/types";
import { CompatibilityIndicator } from "./CompatibilityIndicator";

export function BuildSummary({
  selection,
  evaluation,
  acknowledged,
  onAcknowledge,
  onGoto,
  onClear,
  onReview,
}: {
  selection: Selection;
  evaluation: BuildEvaluation;
  acknowledged: boolean;
  onAcknowledge: (v: boolean) => void;
  onGoto: (c: Category) => void;
  onClear: (c: Category) => void;
  onReview: () => void;
}) {
  const readiness = READINESS_COPY[evaluation.readiness];
  const needsAck = evaluation.readiness === "ready_with_ack";
  const canReview = readiness.canProceed && (!needsAck || acknowledged);

  return (
    <aside className="rounded-xl border border-line bg-surface p-5" aria-label="Build summary">
      <h2 className="text-sm font-semibold tracking-tight text-ink">Your build</h2>

      <ul className="mt-4 divide-y divide-line/70">
        {CATEGORIES.map((c) => {
          const id = selection[c];
          const part = id ? findPart(id) : undefined;
          return (
            <li key={c} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-ink-faint">
                  {CATEGORY_LABELS[c]}
                </p>
                {part ? (
                  <>
                    <p className="truncate text-xs text-ink">{part.name}</p>
                    <p className="font-mono text-[10px] text-ink-faint">
                      {STOCK_LABELS[part.stock] ?? part.stock}
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onGoto(c)}
                    className="text-xs text-accent underline-offset-2 hover:underline"
                  >
                    Not selected — choose
                  </button>
                )}
              </div>
              <div className="shrink-0 text-right">
                {part ? (
                  <>
                    <p className="font-mono text-xs text-ink">{formatPounds(part.price_gbp)}</p>
                    <button
                      type="button"
                      onClick={() => onClear(c)}
                      className="text-[10px] text-ink-faint hover:text-status-fail"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="font-mono text-xs text-ink-faint">—</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm text-ink-muted">Component total</span>
        <span className="font-mono text-xl text-ink">{formatPence(evaluation.totalPence)}</span>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-ink-faint">
        Component prices only. Historical values captured 31 October 2026 — not a live quotation.
        Excludes delivery, assembly and VAT changes.
      </p>

      <div className="mt-5 rounded-lg border border-line bg-raised/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-ink">{readiness.title}</p>
          {evaluation.aggregate ? <CompatibilityIndicator status={evaluation.aggregate} compact /> : null}
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">{readiness.detail}</p>

        {evaluation.missing.length > 0 ? (
          <p className="mt-2 text-[11px] text-ink-faint">
            Missing: {evaluation.missing.map((c) => CATEGORY_LABELS[c]).join(", ")}
          </p>
        ) : null}
      </div>

      {needsAck ? (
        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-ink-muted">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => onAcknowledge(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
          />
          <span>
            I understand this build has {evaluation.advisories.length} unresolved{" "}
            {evaluation.advisories.length === 1 ? "item" : "items"} that could not be verified from
            the available data.
          </span>
        </label>
      ) : null}

      <button
        type="button"
        onClick={onReview}
        disabled={!canReview}
        className="mt-4 min-h-11 w-full rounded-md bg-ink px-4 text-sm font-medium text-void transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-graphite disabled:text-ink-faint"
      >
        Review build
      </button>
    </aside>
  );
}
