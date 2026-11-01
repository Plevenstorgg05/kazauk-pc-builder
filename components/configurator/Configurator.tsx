"use client";

import { useState } from "react";
import { CATEGORY_LABELS, CATEGORIES } from "@/lib/catalog/schema";
import { partsIn } from "@/lib/catalog/normalize";
import { evaluateCandidate } from "@/lib/compatibility/engine";
import { formatPence } from "@/lib/pricing/currency";
import { useBuildConfigurator } from "@/hooks/useBuildConfigurator";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "./ProductCard";
import { BuildSummary } from "./BuildSummary";
import { BuildReview } from "./BuildReview";
import { CompatibilityDetails } from "./CompatibilityDetails";
import { CategoryNav } from "./CategoryNav";

export function Configurator() {
  const cfg = useBuildConfigurator();
  const [reviewing, setReviewing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { evaluation, selection, active } = cfg;
  const parts = partsIn(active);
  const unresolved = evaluation.results.filter((r) => r.status !== "compatible");

  if (reviewing) {
    return (
      <Container className="py-10">
        <BuildReview
          selection={selection}
          evaluation={evaluation}
          onBack={() => setReviewing(false)}
          onEdit={(c) => {
            cfg.goto(c);
            setReviewing(false);
          }}
        />
      </Container>
    );
  }

  const summary = (
    <BuildSummary
      selection={selection}
      evaluation={evaluation}
      acknowledged={cfg.acknowledged}
      onAcknowledge={cfg.acknowledge}
      onGoto={(c) => {
        cfg.goto(c);
        setSheetOpen(false);
      }}
      onClear={cfg.clear}
      onReview={() => {
        setSheetOpen(false);
        setReviewing(true);
      }}
    />
  );

  return (
    <>
      <Container className="pb-28 lg:pb-16">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[218px_minmax(0,1fr)] xl:grid-cols-[218px_minmax(0,1fr)_340px]">
          {/* min-w-0 is load-bearing: without it this grid item will not shrink
              below the rail's intrinsic width and the whole page overflows. */}
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <CategoryNav
              selection={selection}
              active={active}
              evaluation={evaluation}
              onGoto={cfg.goto}
            />
          </div>

          <section aria-labelledby="category-heading" className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="category-heading" className="text-2xl font-semibold tracking-tight">
                {CATEGORY_LABELS[active]}
              </h2>
              <p className="font-mono text-[11px] text-ink-faint">
                {parts.length} {parts.length === 1 ? "option" : "options"}
              </p>
            </div>

            <div
              key={active}
              className="animate-rise mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
            >
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

            {unresolved.length > 0 ? (
              <section className="mt-12" aria-live="polite">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  Issues to review ({unresolved.length})
                </h3>
                <div className="mt-3 space-y-3">
                  {unresolved.map((r) => (
                    <CompatibilityDetails key={r.ruleId} result={r} />
                  ))}
                </div>
              </section>
            ) : null}

            {/*
              Summary placement by breakpoint, with exactly ONE copy live at a time:
                < lg   bottom bar + sheet (below)
                lg-xl  inline here, where a third column would be too cramped
                >= xl  sticky right column
              Rendering more than one produced duplicate landmarks and duplicate
              form controls in the accessibility tree.
            */}
            <div className="mt-12 hidden lg:block xl:hidden">{summary}</div>
          </section>

          <div className="hidden xl:sticky xl:top-24 xl:block xl:self-start">{summary}</div>
        </div>
      </Container>

      {/* Mobile: persistent total bar. Never covers content — the page reserves
          pb-28 for it — and opens the full summary as a sheet. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-base/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              {CATEGORIES.filter((c) => selection[c]).length}/7 selected
            </p>
            <p className="font-mono text-lg leading-tight text-ink">
              {formatPence(evaluation.totalPence)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="min-h-11 rounded-lg border border-line-strong px-4 text-sm font-medium text-ink"
          >
            Your build
          </button>
        </div>
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close build summary"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
          />
          <div className="animate-rise absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-line bg-base p-4">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden />
            {summary}
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="mt-3 min-h-11 w-full rounded-lg border border-line text-sm text-ink-muted"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
