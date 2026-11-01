"use client";

import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/catalog/schema";
import { findPart, STOCK_LABELS } from "@/lib/catalog/normalize";
import { formatPence, formatPounds } from "@/lib/pricing/currency";
import { READINESS_COPY } from "@/lib/compatibility/policy";
import type { BuildEvaluation, Selection } from "@/lib/compatibility/types";
import { CompatibilityDetails } from "./CompatibilityDetails";
import { CompatibilityIndicator } from "./CompatibilityIndicator";
import { CategoryIcon } from "./CategoryIcon";

/** Premium technical build sheet — the payoff screen. */
export function BuildReview({
  selection, evaluation, onBack, onEdit,
}: {
  selection: Selection;
  evaluation: BuildEvaluation;
  onBack: () => void;
  onEdit: (c: Category) => void;
}) {
  const readiness = READINESS_COPY[evaluation.readiness];
  const unresolved = evaluation.results.filter((r) => r.status !== "compatible");
  const passed = evaluation.results.filter((r) => r.status === "compatible");

  return (
    <div className="animate-rise">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex min-h-10 items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden>←</span> Back to configurator
      </button>

      <div className="flex min-w-0 flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent-bright">
            Build sheet
          </p>
          <h1 className="mt-3 text-balance pb-1 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            Your machine
          </h1>
          <p className="mt-3 max-w-lg text-ink-muted">
            A demonstration summary. No order is placed, nothing is reserved, and no stock is held.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-base/60 px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Total</p>
          <p className="mt-1 font-mono text-3xl tracking-tight text-ink">
            {formatPence(evaluation.totalPence)}
          </p>
        </div>
      </div>

      <div className="mt-10 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Components
            </h2>
            <ul className="surface-card mt-3 min-w-0 divide-y divide-line/70 overflow-hidden rounded-xl">
              {CATEGORIES.map((c) => {
                const part = selection[c] ? findPart(selection[c]!) : undefined;
                return (
                  <li
                    key={c}
                    /* Stacks on phones and goes to a single row from sm up.
                       Relying on flex-wrap here caused the price to overlap the
                       Edit button and swallow its pointer events. */
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:flex-1">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-faint">
                        <CategoryIcon category={c} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                          {CATEGORY_LABELS[c]}
                        </p>
                        <p className={`truncate text-sm ${part ? "text-ink" : "text-ink-faint italic"}`}>
                          {part?.name ?? "Not selected"}
                        </p>
                        {part ? (
                          <p className="font-mono text-[10px] text-ink-faint">
                            {STOCK_LABELS[part.stock] ?? part.stock}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 pl-12 sm:justify-end sm:pl-0">
                      <p className="font-mono text-sm text-ink">
                        {part ? (part.price_gbp === 0 ? "Included" : formatPounds(part.price_gbp)) : "—"}
                      </p>
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        className="min-h-9 shrink-0 rounded-lg border border-line px-3 text-xs text-ink-muted transition-colors hover:border-accent/50 hover:text-ink"
                      >
                        Edit
                        <span className="sr-only"> {CATEGORY_LABELS[c]}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {unresolved.length > 0 ? (
            <section>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Needs your attention ({unresolved.length})
              </h2>
              <div className="mt-3 space-y-3">
                {unresolved.map((r) => (
                  <CompatibilityDetails key={r.ruleId} result={r} />
                ))}
              </div>
            </section>
          ) : null}

          {passed.length > 0 ? (
            <section>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Checks passed ({passed.length})
              </h2>
              <ul className="surface-card mt-3 min-w-0 divide-y divide-line/70 overflow-hidden rounded-xl">
                {passed.map((r) => (
                  <li key={r.ruleId} className="flex items-start gap-3 p-3.5">
                    <CompatibilityIndicator status={r.status} compact />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink">{r.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">{r.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-raised rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink">{readiness.title}</h2>
              {evaluation.aggregate ? (
                <CompatibilityIndicator status={evaluation.aggregate} compact />
              ) : null}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">{readiness.detail}</p>

            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-xs">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Checks run</dt>
                <dd className="font-mono text-ink">{evaluation.results.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Blocking issues</dt>
                <dd className="font-mono text-ink">{evaluation.blocking.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Advisories</dt>
                <dd className="font-mono text-ink">{evaluation.advisories.length}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2">
                <dt className="text-ink-muted">Component total</dt>
                <dd className="font-mono text-base text-ink">{formatPence(evaluation.totalPence)}</dd>
              </div>
            </dl>

            <p className="mt-5 text-[10px] leading-relaxed text-ink-faint">
              Technical demonstration using component data captured on 31 October 2026. Prices are
              historical, availability is not live, and no checkout exists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
