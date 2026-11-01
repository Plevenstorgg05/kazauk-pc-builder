"use client";
import type { BuilderProduct } from "@/lib/builder/types";
import { formatPounds } from "@/lib/pricing/currency";
import { BuilderPhoto } from "./BuilderPhoto";
import s from "./Builder.module.css";
export {
  productName,
  productPrice,
  stockLabel,
} from "@/lib/builder/presentation";
import {
  productName,
  productPrice,
  stockLabel,
} from "@/lib/builder/presentation";
export function BuilderProducts({
  products,
  selected,
  onSelect,
  onInspect,
  onCompare,
  compared,
  visual,
}: {
  products: BuilderProduct[];
  selected: BuilderProduct | undefined;
  onSelect: (id: string) => void;
  onInspect: (p: BuilderProduct) => void;
  onCompare: (id: string) => void;
  compared: string[];
  visual: boolean;
}) {
  return (
    <div className={visual ? s.galleryGrid : s.productRows}>
      {products.map((p, index) => {
        const chosen = selected?.id === p.id;
        const delta =
          selected?.price !== null &&
          selected?.price !== undefined &&
          p.price !== null
            ? p.price - selected.price
            : null;
        return (
          <article
            className={`${s.product} ${chosen ? s.selectedProduct : ""}`}
            key={p.id}
            data-product-id={p.id}
          >
            <div className={s.productImageArea}>
              <button
                type="button"
                className={s.productImageButton}
                aria-label={`Inspect ${p.name}`}
                onClick={() => onInspect(p)}
              >
                <BuilderPhoto
                  product={p}
                  eager={index < 2}
                  size={visual ? "gallery" : "row"}
                />
              </button>
              <button
                type="button"
                className={s.productInspect}
                aria-label={`Details for ${p.name}`}
                onClick={() => onInspect(p)}
              >
                ↗
              </button>
              {chosen ? (
                <span className={s.selectedFlag}>✓ SELECTED</span>
              ) : null}
            </div>
            <div className={s.productContent}>
              <div className={s.productBrand}>
                <span>{p.brand}</span>
                <span>
                  {p.origin === "original" ? "DEMO SNAPSHOT" : "RESEARCHED"}
                </span>
              </div>
              <h3>
                <button type="button" onClick={() => onInspect(p)}>
                  {productName(p)}
                </button>
              </h3>
              <p className={s.availability}>{stockLabel(p)}</p>
              <dl className={s.cardSpecs}>
                {p.specs.slice(0, 4).map((spec) => (
                  <div key={spec.key}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
              <div className={s.cardPrice}>
                <strong>{productPrice(p)}</strong>
                {delta !== null && !chosen ? (
                  <span>
                    {delta === 0
                      ? "Same price"
                      : `${delta > 0 ? "+" : "−"}${formatPounds(Math.abs(delta))}`}{" "}
                    vs current selection
                  </span>
                ) : null}
              </div>
              <div className={s.productControls}>
                <button
                  type="button"
                  className={chosen ? s.selectedButton : s.primary}
                  aria-pressed={chosen}
                  onClick={() => onSelect(p.id)}
                >
                  {chosen
                    ? "Selected"
                    : `Select ${p.category === "case" ? "case" : "component"}`}
                  <span aria-hidden>{chosen ? "✓" : "＋"}</span>
                </button>
                <button
                  type="button"
                  className={s.compareChoice}
                  aria-pressed={compared.includes(p.id)}
                  disabled={!compared.includes(p.id) && compared.length >= 3}
                  onClick={() => onCompare(p.id)}
                >
                  {compared.includes(p.id) ? "☑" : "□"} Compare
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
