"use client";

import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/catalog/schema";
import { findPart, STOCK_LABELS } from "@/lib/catalog/normalize";
import { formatPence, formatPounds } from "@/lib/pricing/currency";
import { READINESS_COPY } from "@/lib/compatibility/policy";
import type { BuildEvaluation, Selection } from "@/lib/compatibility/types";
import { CompatibilityIndicator } from "./CompatibilityIndicator";
import { CategoryIcon } from "./CategoryIcon";

const READINESS_TONE = {
  incomplete: "border-line text-ink-muted",
  blocked: "border-status-fail/40 text-status-fail",
  ready_with_ack: "border-status-caution/40 text-status-caution",
  ready: "border-status-ok/40 text-status-ok",
} as const;

export function BuildSummary({
  selection, evaluation, acknowledged, onAcknowledge, onGoto, onClear, onReview,
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
  const chosen = CATEGORIES.filter((c) => selection[c]).length;
  const pct = Math.round((chosen / CATEGORIES.length) * 100);

  return (
    <aside className="surface-raised rounded-2xl p-5" aria-label="Build summary">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold tracking-tight text-ink">Your build</h2>
        <span className="font-mono text-[11px] text-ink-faint">{chosen}/7</span>
      </div>

      {/* Progress. aria-hidden because the figure above already states it. */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-base" aria-hidden>
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent-bright transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-5 space-y-1">
        {CATEGORIES.map((c) => {
          const id = selection[c];
          const part = id ? findPart(id) : undefined;
          const issue = evaluation.results.some(
            (r) => r.categories.includes(c) && r.status === "incompatible",
          );
          return (
            <li key={c}>
              <div
                className={`flex items-start gap-3 rounded-lg px-2.5 py-2.5 transition-colors ${
                  part ? "bg-base/50" : ""
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                    issue
                      ? "border-status-fail/50 text-status-fail"
                      : part
                        ? "border-accent/40 text-accent-bright"
                        : "border-line text-ink-faint"
                  }`}
                >
                  <CategoryIcon category={c} className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                    {CATEGORY_LABELS[c]}
                  </p>
                  {part ? (
                    <>
                      <p className="truncate text-xs leading-snug text-ink">{part.name}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
                        {STOCK_LABELS[part.stock] ?? part.stock}
                      </p>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onGoto(c)}
                      className="text-xs text-accent-bright underline-offset-2 hover:underline"
                    >
                      Choose {CATEGORY_LABELS[c].toLowerCase()}
                    </button>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {part ? (
                    <>
                      <p className="font-mono text-xs text-ink">
                        {part.price_gbp === 0 ? "—" : formatPounds(part.price_gbp)}
                      </p>
                      <button
                        type="button"
                        onClick={() => onClear(c)}
                        className="mt-0.5 text-[10px] text-ink-faint transition-colors hover:text-status-fail"
                      >
                        Remove
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm text-ink-muted">Component total</span>
        <span className="font-mono text-2xl tracking-tight text-ink" aria-live="polite">
          {formatPence(evaluation.totalPence)}
        </span>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-ink-faint">
        Component prices only, captured 31 October 2026. Not a live quotation; excludes delivery
        and assembly.
      </p>

      <div className={`mt-5 rounded-xl border bg-base/60 p-3.5 ${READINESS_TONE[evaluation.readiness]}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold">{readiness.title}</p>
          {evaluation.aggregate ? <CompatibilityIndicator status={evaluation.aggregate} compact /> : null}
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">{readiness.detail}</p>
        {evaluation.missing.length > 0 ? (
          <p className="mt-2 text-[11px] text-ink-faint">
            Still needed: {evaluation.missing.map((c) => CATEGORY_LABELS[c]).join(", ")}
          </p>
        ) : null}
      </div>

      {needsAck ? (
        <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-base/40 p-3 text-[11px] leading-relaxed text-ink-muted">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => onAcknowledge(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
          />
          <span>
            I understand {evaluation.advisories.length} {evaluation.advisories.length === 1 ? "item" : "items"} could not be verified from the available data.
          </span>
        </label>
      ) : null}

      <button
        type="button"
        onClick={onReview}
        disabled={!canReview}
        className="mt-4 min-h-11 w-full rounded-lg bg-gradient-to-b from-accent-bright to-accent px-4 text-sm font-semibold text-void shadow-[0_10px_30px_-12px_var(--color-accent)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-none disabled:bg-elevated disabled:text-ink-faint disabled:shadow-none"
      >
        Review build
      </button>
    </aside>
  );
}
