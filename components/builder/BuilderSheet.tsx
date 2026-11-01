"use client";
import {
  categoryInfo,
  CATEGORY_INFO,
  type BuilderCategory,
} from "@/lib/builder/categories";
import { productById } from "@/lib/builder/catalogue";
import type { BuilderSelection } from "@/lib/builder/types";
import { formatPence } from "@/lib/pricing/currency";
import { BuilderPhoto } from "./BuilderPhoto";
import { productPrice, productName } from "@/lib/builder/presentation";
import { coolerIncluded, type DemoBuild } from "@/lib/builder/demo";
import s from "./Builder.module.css";
export function BuilderSheet({
  selection,
  evaluation,
  onGoto,
  onRemove,
  onReview,
  onReset,
  onShare,
  saved,
  restoring,
}: {
  selection: BuilderSelection;
  evaluation: DemoBuild;
  onGoto: (c: BuilderCategory) => void;
  onRemove: (c: BuilderCategory) => void;
  onReview: () => void;
  onReset: () => void;
  onShare: () => void;
  saved: boolean;
  restoring: boolean;
}) {
  const core = CATEGORY_INFO.filter((c) => c.group === 0 && c.id !== "hdd");
  const extras = CATEGORY_INFO.filter(
    (c) => (c.group !== 0 || c.id === "hdd") && selection[c.id],
  );
  const cpu = productById(selection.cpu);
  const included = coolerIncluded(cpu);
  const row = (c: (typeof CATEGORY_INFO)[number]) => {
    const p = productById(selection[c.id]);
    const covered = c.id === "cooler" && included && !p;
    const storageViaHDD = c.id === "ssd" && !p && Boolean(selection.hdd);
    return (
      <li key={c.id} data-empty={!p && !covered && !storageViaHDD}>
        {p ? (
          <BuilderPhoto product={p} size="thumb" />
        ) : (
          <span className={s.sheetPlaceholder} aria-hidden>
            {covered || storageViaHDD ? "✓" : "＋"}
          </span>
        )}
        <div>
          <button
            type="button"
            className={s.sheetEdit}
            data-empty={!p && !covered && !storageViaHDD}
            onClick={() => onGoto(c.id)}
            aria-label={`Edit ${c.label}`}
          >
            <span>{c.label}</span>
            <strong>
              {p
                ? productName(p)
                : covered
                  ? "Boxed CPU cooler included"
                  : storageViaHDD
                    ? "Covered by selected HDD"
                    : "Select"}{" "}
              <span aria-hidden>↗</span>
            </strong>
          </button>
          {p ? (
            <button
              type="button"
              className={s.remove}
              onClick={() => onRemove(c.id)}
              aria-label={`Remove ${c.label}`}
            >
              Remove
            </button>
          ) : null}
        </div>
        <span className={s.sheetPrice}>
          {p ? productPrice(p) : covered ? "Included" : "—"}
        </span>
      </li>
    );
  };
  return (
    <aside className={s.sheet} aria-label="Build summary">
      <div className={s.sheetTop}>
        <span className={s.kicker}>YOUR SPECIFICATION</span>
        <span className={s.sheetStamp}>KAZAUK / 01</span>
      </div>
      <h2>
        Your build
        <span>
          {evaluation.covered}
          <small>/{evaluation.required}</small>
        </span>
      </h2>
      <div
        className={s.progress}
        role="progressbar"
        aria-label="Essential build progress"
        aria-valuemin={0}
        aria-valuemax={evaluation.required}
        aria-valuenow={evaluation.covered}
      >
        <span
          style={{
            width: `${(evaluation.covered / evaluation.required) * 100}%`,
          }}
        />
      </div>
      <p className={s.progressCaption}>Essential selections covered</p>
      <ol className={s.sheetItems}>{core.map(row)}</ol>
      {extras.length ? (
        <>
          <h3 className={s.sheetExtraHeading}>
            {selection.hdd
              ? "Storage & optional extras"
              : "Optional hardware & extras"}{" "}
            ({extras.length})
          </h3>
          <ol className={s.sheetItems}>{extras.map(row)}</ol>
        </>
      ) : null}
      <div className={s.sheetTotal}>
        <span>
          {evaluation.unpriced.length ? "Known subtotal" : "Component total"}
        </span>
        <strong aria-live="polite">{formatPence(evaluation.totalPence)}</strong>
      </div>
      {evaluation.unpriced.length ? (
        <p className={s.quoteNote}>
          {evaluation.unpriced.length} selected products require a quote and are
          excluded from this subtotal.
        </p>
      ) : null}
      <p className={s.sheetNote}>
        GBP · Historical and researched snapshots.
        <br />
        Not a live quote. Excludes delivery & assembly.
      </p>
      <div className={s.sheetCompatibility}>
        <span className={s.kicker}>DEMO SPECIFICATION</span>
        <p>
          {evaluation.missing.length
            ? `Still to choose: ${evaluation.missing.map((c) => (c === "ssd" ? "SSD or HDD" : categoryInfo(c).label)).join(", ")}.`
            : "All essential selections are covered."}
        </p>
        <p>Unrestricted combinations. Compatibility is not guaranteed.</p>
      </div>
      <button type="button" className={s.primary} onClick={onReview}>
        Review build <span aria-hidden>↗</span>
      </button>
      <p className={s.reviewHint}>
        Review and save your selections at any stage.
      </p>
      <div className={s.sheetTools}>
        <button type="button" onClick={onShare}>
          Save & share ↗
        </button>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset build"
          disabled={!Object.keys(selection).length}
        >
          Reset
        </button>
      </div>
      <p className={s.localSaved}>
        {restoring
          ? "Restoring saved selections…"
          : saved
            ? "Saved on this device"
            : "Local saving unavailable"}
      </p>
    </aside>
  );
}
