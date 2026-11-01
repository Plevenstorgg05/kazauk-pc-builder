"use client";
import type { AnyPart, Category } from "@/lib/catalog/schema";
import { STOCK_LABELS } from "@/lib/catalog/normalize";
import { formatPounds } from "@/lib/pricing/currency";
import {
  displayName,
  manufacturer,
  specsFor,
} from "@/lib/configurator/products";
import type { RuleResult, Status } from "@/lib/compatibility/types";
import { CompatibilityIndicator } from "./CompatibilityIndicator";
import { ProductMedia } from "./ProductMedia";
import s from "./Workspace.module.css";
export function ProductCard({
  part,
  category,
  selected,
  status,
  reasons,
  onSelect,
  onDetails,
  compared,
  onCompare,
  delta,
}: {
  part: AnyPart;
  category: Category;
  selected: boolean;
  status: Status | null;
  reasons: RuleResult[];
  onSelect: () => void;
  onDetails: () => void;
  compared: boolean;
  onCompare: () => void;
  delta: number | null;
}) {
  const specs = specsFor(category, part).slice(0, 3);
  return (
    <article className={`${s.product} ${selected ? s.productSelected : ""}`}>
      <button
        className={s.mediaButton}
        type="button"
        aria-label={`Inspect ${displayName(part)}`}
        onClick={onDetails}
      >
        <ProductMedia part={part} category={category} />
        <span className={s.inspectLabel}>Explore component ↗</span>
      </button>
      <div className={s.productInfo}>
        <div className={s.productMeta}>
          <span>{manufacturer(part)}</span>
          <span className={part.stock === "sold_out" ? s.attention : ""}>
            {STOCK_LABELS[part.stock]}
          </span>
        </div>
        <h3>
          <button type="button" onClick={onDetails}>
            {displayName(part)}
          </button>
        </h3>
        <dl className={s.quickSpecs}>
          {specs.map((spec) => (
            <div key={spec.key}>
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
        <div className={s.productStatus}>
          {status ? (
            <CompatibilityIndicator status={status} />
          ) : (
            <span className={s.muted}>Choose related parts to check fit</span>
          )}
          {reasons[0] ? <p>{reasons[0].message}</p> : null}
        </div>
      </div>
      <div className={s.productActions}>
        <p className={s.price}>
          {part.price_gbp === 0 ? "Included" : formatPounds(part.price_gbp)}
        </p>
        {delta !== null && !selected ? (
          <span className={s.priceDifference}>
            {delta === 0
              ? "Same price"
              : `${delta > 0 ? "+" : "−"}${formatPounds(Math.abs(delta))}`}{" "}
            vs selected
          </span>
        ) : null}
        <button
          type="button"
          className={selected ? s.selectedButton : s.primaryButton}
          aria-pressed={selected}
          onClick={onSelect}
        >
          {selected
            ? "Selected ✓"
            : status === "incompatible"
              ? "Select anyway"
              : "Select component"}
        </button>
        <button
          type="button"
          className={s.compareToggle}
          aria-pressed={compared}
          onClick={onCompare}
        >
          <span aria-hidden>{compared ? "☑" : "＋"}</span>{" "}
          {compared ? "In comparison" : "Compare"}
        </button>
      </div>
    </article>
  );
}
