"use client";

import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/catalog/schema";
import type { BuildEvaluation, Selection } from "@/lib/compatibility/types";
import { CategoryIcon } from "./CategoryIcon";

/**
 * Category navigation. Vertical rail on desktop, horizontal scroller on mobile.
 *
 * Each item carries three independent signals — selected, active, and whether
 * any unresolved finding touches that category — so a user can see where a
 * problem lives without opening every step.
 */
export function CategoryNav({
  selection,
  active,
  evaluation,
  onGoto,
}: {
  selection: Selection;
  active: Category;
  evaluation: BuildEvaluation;
  onGoto: (c: Category) => void;
}) {
  const issueFor = (c: Category) => {
    const hits = evaluation.results.filter((r) => r.categories.includes(c) && r.status !== "compatible");
    if (hits.some((r) => r.status === "incompatible")) return "fail" as const;
    if (hits.length > 0) return "caution" as const;
    return null;
  };

  return (
    <nav aria-label="Component categories">
      <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {CATEGORIES.map((c, i) => {
          const chosen = Boolean(selection[c]);
          const isActive = c === active;
          const issue = issueFor(c);
          return (
            <li key={c} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onGoto(c)}
                aria-current={isActive ? "step" : undefined}
                className={`group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-elevated text-ink shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]"
                    : "text-ink-muted hover:bg-raised/70 hover:text-ink"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    chosen
                      ? "border-accent/50 bg-accent/15 text-accent-bright"
                      : "border-line text-ink-faint group-hover:text-ink-muted"
                  }`}
                >
                  <CategoryIcon category={c} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="whitespace-nowrap text-sm font-medium lg:whitespace-normal">
                    {CATEGORY_LABELS[c]}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                    {chosen ? "Selected" : `Step ${i + 1}`}
                  </span>
                </span>
                {issue ? (
                  <span
                    className={`ml-auto hidden h-1.5 w-1.5 shrink-0 rounded-full lg:block ${
                      issue === "fail" ? "bg-status-fail" : "bg-status-caution"
                    }`}
                  >
                    <span className="sr-only">
                      {issue === "fail" ? "Has an incompatibility" : "Needs attention"}
                    </span>
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
