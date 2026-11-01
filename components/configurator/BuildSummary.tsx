"use client";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
} from "@/lib/catalog/schema";
import { findPart, STOCK_LABELS } from "@/lib/catalog/normalize";
import { formatPence, formatPounds } from "@/lib/pricing/currency";
import { READINESS_COPY } from "@/lib/compatibility/policy";
import type { BuildEvaluation, Selection } from "@/lib/compatibility/types";
import { displayName } from "@/lib/configurator/products";
import { ProductMedia } from "./ProductMedia";
import { CategoryIcon } from "./CategoryIcon";
import { CompatibilityIndicator } from "./CompatibilityIndicator";
import { coveredCount } from "@/lib/configurator/progress";
import s from "./Workspace.module.css";
export function BuildSummary({
  selection,
  evaluation,
  acknowledged,
  onAcknowledge,
  onGoto,
  onClear,
  onReview,
  onInspect,
  onReset,
  onShare,
  storageAvailable,
}: {
  selection: Selection;
  evaluation: BuildEvaluation;
  acknowledged: boolean;
  onAcknowledge: (v: boolean) => void;
  onGoto: (c: Category) => void;
  onClear: (c: Category) => void;
  onReview: () => void;
  onInspect: () => void;
  onReset: () => void;
  onShare: () => void;
  storageAvailable: boolean;
}) {
  const readiness = READINESS_COPY[evaluation.readiness];
  const needsAck = evaluation.readiness === "ready_with_ack";
  const canReview = readiness.canProceed && (!needsAck || acknowledged);
  const covered = coveredCount(selection);
  const issues = evaluation.blocking.length + evaluation.advisories.length;
  return (
    <aside className={s.buildSheet} aria-label="Build summary">
      <div className={s.sheetTitle}>
        <span className={s.eyebrow}>IONZ / Build sheet</span>
        <span className={s.sheetSerial}>AM5 · 001</span>
      </div>
      <div className={s.sheetHeading}>
        <h2>Your build</h2>
        <span>
          {covered}
          <small> / 7</small>
        </span>
      </div>
      <div
        className={s.progressTrack}
        role="progressbar"
        aria-label="Components covered"
        aria-valuenow={covered}
        aria-valuemin={0}
        aria-valuemax={7}
      >
        <span style={{ width: `${(covered / 7) * 100}%` }} />
      </div>
      <ol className={s.sheetParts}>
        {CATEGORIES.map((c, i) => {
          const part = selection[c] ? findPart(selection[c]!) : undefined;
          const included =
            c === "cooler" &&
            !part &&
            coveredCount(selection) >
              CATEGORIES.filter((x) => selection[x]).length;
          return (
            <li key={c}>
              <span className={s.sheetIndex}>
                {part ? (
                  <ProductMedia part={part} category={c} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <div className={s.sheetPart}>
                <button
                  type="button"
                  onClick={() => onGoto(c)}
                  className={s.sheetPartEdit}
                  aria-label={`Edit ${CATEGORY_LABELS[c]}`}
                >
                  <span>{CATEGORY_LABELS[c]}</span>
                  <strong>
                    {part
                      ? displayName(part)
                      : included
                        ? "Boxed CPU cooler included"
                        : "Choose component"}{" "}
                    <span aria-hidden>↗</span>
                  </strong>
                </button>
                {part ? (
                  <small
                    className={
                      part.stock === "sold_out" ? s.attention : s.muted
                    }
                  >
                    {STOCK_LABELS[part.stock]}
                  </small>
                ) : null}
              </div>
              <div className={s.sheetPartPrice}>
                {part ? (
                  <>
                    <span>
                      {part.price_gbp === 0
                        ? "Included"
                        : formatPounds(part.price_gbp)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onClear(c)}
                      aria-label={`Remove ${CATEGORY_LABELS[c]}`}
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <CategoryIcon category={c} />
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className={s.sheetTotal}>
        <span>Component total</span>
        <strong aria-live="polite">{formatPence(evaluation.totalPence)}</strong>
      </div>
      <p className={s.snapshot}>
        GBP · Prices captured 31 Oct 2026.
        <br />
        Excludes delivery & assembly. Not a live quote.
      </p>
      <div className={s.sheetHealth}>
        <div>
          <strong>{readiness.title}</strong>
          {evaluation.aggregate ? (
            <CompatibilityIndicator status={evaluation.aggregate} compact />
          ) : null}
        </div>
        <p>
          {evaluation.missing.length
            ? `Still needed: ${evaluation.missing.map((c) => CATEGORY_LABELS[c]).join(", ")}.`
            : issues
              ? `${issues} ${issues === 1 ? "finding needs" : "findings need"} your attention. Review the evidence before continuing.`
              : "Every check available in this demonstration has passed."}
        </p>
      </div>
      {needsAck ? (
        <label className={s.acknowledge}>
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => onAcknowledge(e.target.checked)}
          />
          <span>
            I understand {evaluation.advisories.length} findings need
            verification from the available data.
          </span>
        </label>
      ) : null}
      <button
        type="button"
        className={s.primaryButton}
        disabled={!canReview}
        onClick={onReview}
      >
        Review build <span aria-hidden>↗</span>
      </button>
      {!canReview ? (
        <button type="button" className={s.textButton} onClick={onInspect}>
          Inspect build
        </button>
      ) : null}
      <div className={s.sheetUtilities}>
        <button type="button" onClick={onShare}>
          Copy build link ↗
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!Object.keys(selection).length}
        >
          Reset build
        </button>
      </div>
      <p className={s.savedNote}>
        {storageAvailable
          ? "↳ Saved automatically on this device"
          : "Local saving unavailable in this browser"}
      </p>
    </aside>
  );
}
