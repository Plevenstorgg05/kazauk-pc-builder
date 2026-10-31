"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/catalog/schema";
import { partsIn, findPart } from "@/lib/catalog/normalize";
import { evaluateCandidate } from "@/lib/compatibility/engine";
import { formatPence } from "@/lib/pricing/currency";
import { useBuildConfigurator } from "@/hooks/useBuildConfigurator";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "./ProductCard";
import { BuildSummary } from "./BuildSummary";
import { CompatibilityDetails } from "./CompatibilityDetails";
import { CompatibilityIndicator } from "./CompatibilityIndicator";

export function Configurator() {
  const cfg = useBuildConfigurator();
  const [reviewing, setReviewing] = useState(false);
  const { evaluation, selection, active } = cfg;

  const parts = partsIn(active);

  if (reviewing) {
    return (
      <Container className="py-10">
        <button
          type="button"
          onClick={() => setReviewing(false)}
          className="mb-6 text-sm text-ink-muted hover:text-ink"
        >
          ← Back to configurator
        </button>
        <h1 className="text-3xl font-semibold tracking-tight">Build review</h1>
        <p className="mt-2 max-w-xl text-ink-muted">
          A demonstration summary. No order is placed and nothing is reserved.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
                Components
              </h2>
              <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
                {CATEGORIES.map((c) => {
                  const part = selection[c] ? findPart(selection[c]!) : undefined;
                  return (
                    <li key={c} className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-ink-faint">
                          {CATEGORY_LABELS[c]}
                        </p>
                        <p className="text-sm text-ink">{part?.name ?? "Not selected"}</p>
                      </div>
                      <p className="font-mono text-sm text-ink">
                        {part ? formatPence(Math.round(part.price_gbp * 100)) : "—"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
                All compatibility checks ({evaluation.results.length})
              </h2>
              <div className="mt-3 space-y-3">
                {evaluation.results.map((r) => (
                  <CompatibilityDetails key={r.ruleId} result={r} />
                ))}
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-line bg-surface p-5">
              <p className="text-sm text-ink-muted">Component total</p>
              <p className="mt-1 font-mono text-3xl text-ink">
                {formatPence(evaluation.totalPence)}
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
                Historical prices captured 31 October 2026. This is a technical demonstration,
                not a live store, and no stock is reserved.
              </p>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="grid gap-8 lg:grid-cols-[200px_1fr_340px]">
        {/* Category navigation */}
        <nav aria-label="Component categories" className="lg:sticky lg:top-24 lg:self-start">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {CATEGORIES.map((c, i) => {
              const chosen = Boolean(selection[c]);
              const isActive = c === active;
              return (
                <li key={c} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => cfg.goto(c)}
                    aria-current={isActive ? "step" : undefined}
                    className={`flex w-full min-h-11 items-center gap-2.5 rounded-md px-3 text-left text-sm transition-colors ${
                      isActive ? "bg-raised text-ink" : "text-ink-muted hover:bg-raised/60 hover:text-ink"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono ${
                        chosen ? "bg-accent text-void" : "border border-line text-ink-faint"
                      }`}
                    >
                      {chosen ? "✓" : i + 1}
                    </span>
                    <span className="whitespace-nowrap lg:whitespace-normal">{CATEGORY_LABELS[c]}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Product selection */}
        <section aria-live="polite">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">{CATEGORY_LABELS[active]}</h2>
            <p className="font-mono text-xs text-ink-faint">{parts.length} options</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {parts.map((part) => {
              const { status, reasons } = evaluateCandidate(selection, active, part.id);
              return (
                <ProductCard
                  key={part.id}
                  part={part}
                  category={active}
                  selected={selection[active] === part.id}
                  status={status}
                  reasons={reasons}
                  onSelect={() => cfg.select(active, part.id)}
                />
              );
            })}
          </div>

          {evaluation.results.filter((r) => r.status !== "compatible").length > 0 ? (
            <section className="mt-10">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink-faint">
                Issues to review
                {evaluation.aggregate ? <CompatibilityIndicator status={evaluation.aggregate} compact /> : null}
              </h3>
              <div className="mt-3 space-y-3">
                {evaluation.results
                  .filter((r) => r.status !== "compatible")
                  .map((r) => (
                    <CompatibilityDetails key={r.ruleId} result={r} />
                  ))}
              </div>
            </section>
          ) : null}
        </section>

        {/* Sticky summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BuildSummary
            selection={selection}
            evaluation={evaluation}
            acknowledged={cfg.acknowledged}
            onAcknowledge={cfg.acknowledge}
            onGoto={cfg.goto}
            onClear={cfg.clear}
            onReview={() => setReviewing(true)}
          />
        </div>
      </div>
    </Container>
  );
}
