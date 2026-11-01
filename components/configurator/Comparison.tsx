"use client";
import { useState } from "react";
import type { AnyPart, Category } from "@/lib/catalog/schema";
import type { Selection } from "@/lib/compatibility/types";
import { specsFor, displayName } from "@/lib/configurator/products";
import { formatPounds } from "@/lib/pricing/currency";
import { evaluateCandidate } from "@/lib/compatibility/engine";
import { STOCK_LABELS } from "@/lib/catalog/normalize";
import { CompatibilityIndicator } from "./CompatibilityIndicator";
import { Dialog } from "./Dialog";
import { ProductMedia } from "./ProductMedia";
import s from "./Workspace.module.css";
export function Comparison({
  parts,
  category,
  selection,
  onSelect,
  onRemove,
  onClose,
}: {
  parts: AnyPart[];
  category: Category;
  selection: Selection;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const [differentOnly, setDifferentOnly] = useState(false);
  const rows = Array.from(
    new Set(parts.flatMap((p) => specsFor(category, p).map((x) => x.key))),
  ).map((key) => ({
    key,
    label: specsFor(
      category,
      parts.find((p) => specsFor(category, p).some((x) => x.key === key))!,
    ).find((x) => x.key === key)!.label,
    values: parts.map(
      (p) =>
        specsFor(category, p).find((x) => x.key === key)?.value ??
        "Not published",
    ),
  }));
  return (
    <Dialog title="Compare components" onClose={onClose} wide>
      <div className={s.compareIntro}>
        <p>Compare exact specifications. Missing data remains unknown.</p>
        <label>
          <input
            type="checkbox"
            checked={differentOnly}
            onChange={(e) => setDifferentOnly(e.target.checked)}
          />{" "}
          Differences only
        </label>
      </div>
      <div
        className={s.compareGrid}
        style={{ "--compare-count": parts.length } as React.CSSProperties}
      >
        {parts.map((part, i) => {
          const e = evaluateCandidate(selection, category, part.id);
          return (
            <section key={part.id} className={s.compareColumn}>
              <button
                type="button"
                className={s.textButton}
                onClick={() => onRemove(part.id)}
                aria-label={`Remove ${displayName(part)} from comparison`}
              >
                Remove ×
              </button>
              <ProductMedia part={part} category={category} />
              <h3>{displayName(part)}</h3>
              <p className={s.price}>{formatPounds(part.price_gbp)}</p>
              <p className={s.muted}>{STOCK_LABELS[part.stock]}</p>
              {e.status ? (
                <CompatibilityIndicator status={e.status} />
              ) : (
                <p className={s.muted}>Not checked yet</p>
              )}
              <dl>
                {rows
                  .filter((r) => !differentOnly || new Set(r.values).size > 1)
                  .map((r) => (
                    <div
                      className={
                        new Set(r.values).size > 1 ? s.specDifferent : ""
                      }
                      key={r.key}
                    >
                      <dt>{r.label}</dt>
                      <dd>{r.values[i]}</dd>
                    </div>
                  ))}
              </dl>
              <button
                type="button"
                className={s.primaryButton}
                onClick={() => onSelect(part.id)}
              >
                {selection[category] === part.id
                  ? "Selected ✓"
                  : "Select component"}
              </button>
            </section>
          );
        })}
      </div>
    </Dialog>
  );
}
