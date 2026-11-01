"use client";
import { useRef, useEffect } from "react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
} from "@/lib/catalog/schema";
import { findPart, STOCK_LABELS } from "@/lib/catalog/normalize";
import { displayName } from "@/lib/configurator/products";
import { formatPence, formatPounds } from "@/lib/pricing/currency";
import type { BuildEvaluation, Selection } from "@/lib/compatibility/types";
import { ProductMedia } from "./ProductMedia";
import { CompatibilityDetails } from "./CompatibilityDetails";
import { CompatibilityIndicator } from "./CompatibilityIndicator";
import { coveredCount } from "@/lib/configurator/progress";
import s from "./Workspace.module.css";
export function BuildReview({
  selection,
  evaluation,
  onBack,
  onEdit,
  onShare,
}: {
  selection: Selection;
  evaluation: BuildEvaluation;
  onBack: () => void;
  onEdit: (c: Category) => void;
  onShare: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const issues = evaluation.results.filter((r) => r.status !== "compatible");
  const passed = evaluation.results.filter((r) => r.status === "compatible");
  const cpu = selection.cpu ? findPart(selection.cpu) : undefined;
  return (
    <div className={s.review}>
      <button type="button" className={s.textButton} onClick={onBack}>
        ← Back to configurator
      </button>
      <div className={s.reviewHeading}>
        <div>
          <p className={s.eyebrow}>
            IONZ / Build sheet / {coveredCount(selection)} of 7 covered
          </p>
          <h2 ref={heading} tabIndex={-1}>
            Your machine
          </h2>
          <p className={s.muted}>
            Every choice, in one place. Review the details before taking the
            next step.
          </p>
        </div>
        <div>
          <p className={s.eyebrow}>Component total</p>
          <strong className={s.reviewTotal}>
            {formatPence(evaluation.totalPence)}
          </strong>
        </div>
      </div>
      <div className={s.reviewLayout}>
        <section>
          <h3 className={s.sectionHeading}>Components</h3>
          <ol className={s.reviewParts}>
            {CATEGORIES.map((c) => {
              const part = selection[c] ? findPart(selection[c]!) : undefined;
              const included =
                c === "cooler" &&
                !part &&
                cpu &&
                "cooler_included" in cpu &&
                cpu.cooler_included;
              return (
                <li key={c}>
                  {part ? (
                    <ProductMedia part={part} category={c} />
                  ) : (
                    <span className={s.reviewEmpty}>—</span>
                  )}
                  <div>
                    <span className={s.eyebrow}>{CATEGORY_LABELS[c]}</span>
                    <strong>
                      {part
                        ? displayName(part)
                        : included
                          ? "Boxed cooler included with CPU"
                          : "Not selected"}
                    </strong>
                    <small className={s.muted}>
                      {part
                        ? STOCK_LABELS[part.stock]
                        : included
                          ? "No additional component cost"
                          : "Required selections are listed in the checks"}
                    </small>
                  </div>
                  <span className={s.reviewPrice}>
                    {part
                      ? part.price_gbp === 0
                        ? "Included"
                        : formatPounds(part.price_gbp)
                      : included
                        ? "Included"
                        : "—"}
                  </span>
                  <button
                    type="button"
                    className={s.secondaryButton}
                    onClick={() => onEdit(c)}
                    aria-label={`Edit ${CATEGORY_LABELS[c]}`}
                  >
                    Edit ↗
                  </button>
                </li>
              );
            })}
          </ol>
          <h3 className={s.sectionHeading}>Compatibility evidence</h3>
          {evaluation.missing.length ? (
            <p className={s.reviewWarning}>
              Still needed:{" "}
              {evaluation.missing.map((c) => CATEGORY_LABELS[c]).join(", ")}.
            </p>
          ) : null}
          <div className={s.findings}>
            {issues.map((r) => (
              <div key={r.ruleId}>
                <CompatibilityDetails result={r} />
                <div className={s.resolutionLinks}>
                  {r.categories.map((c) => (
                    <button
                      type="button"
                      className={s.textButton}
                      key={c}
                      onClick={() => onEdit(c)}
                    >
                      Review {CATEGORY_LABELS[c]} ↗
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <details className={s.disclosure}>
            <summary>Checks passed ({passed.length})</summary>
            <ul className={s.passedList}>
              {passed.map((r) => (
                <li key={r.ruleId}>
                  <CompatibilityIndicator status={r.status} compact />
                  <div>
                    <strong>{r.title}</strong>
                    <p>{r.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </section>
        <aside className={s.reviewAside}>
          <span className={s.eyebrow}>The final check</span>
          <h3>
            {evaluation.missing.length
              ? "A work in progress."
              : evaluation.blocking.length
                ? "Resolve the conflicts."
                : evaluation.advisories.length
                  ? "Almost there. Verify the details."
                  : "Your specification is ready."}
          </h3>
          <p>
            {evaluation.blocking.length} blocking issues ·{" "}
            {evaluation.advisories.length} advisories
          </p>
          <p>
            This is a demonstration specification. No order is placed, nothing
            is reserved and availability is not live.
          </p>
          <button type="button" className={s.primaryButton} onClick={onShare}>
            Copy build link ↗
          </button>
          <p className={s.snapshot}>
            Prices captured 31 October 2026. Excludes delivery and assembly.
            Compatibility covers the supplied rules, not every possible physical
            or firmware constraint.
          </p>
        </aside>
      </div>
    </div>
  );
}
