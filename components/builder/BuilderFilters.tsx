"use client";
import type { BuilderProduct } from "@/lib/builder/types";
import s from "./Builder.module.css";
export interface Filters {
  query: string;
  brand: string;
  max: string;
  sort: string;
  spec: string;
}
export const EMPTY_FILTERS: Filters = {
  query: "",
  brand: "all",
  max: "",
  sort: "recommended",
  spec: "",
};
export function BuilderFilters({
  products,
  value,
  onChange,
  count,
}: {
  products: BuilderProduct[];
  value: Filters;
  onChange: (v: Filters) => void;
  count: number;
}) {
  const brands = [...new Set(products.map((p) => p.brand))];
  const refined =
    (value.brand === "all" ? 0 : 1) +
    (value.max ? 1 : 0) +
    (value.spec ? 1 : 0);
  return (
    <div className={s.filters}>
      <div className={s.filterTop}>
        <label className={s.search}>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden
          >
            <circle cx="10" cy="10" r="6" />
            <path d="m15 15 6 6" />
          </svg>
          <input
            type="search"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            aria-label="Search products"
            placeholder="Search model or manufacturer"
          />
        </label>
        <label className={s.sort}>
          Sort by
          <select
            value={value.sort}
            onChange={(e) => onChange({ ...value, sort: e.target.value })}
            aria-label="Sort products"
          >
            <option value="recommended">Catalogue selection</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </label>
      </div>
      <details className={s.moreFilters}>
        <summary>
          More filters {refined ? `(${refined})` : ""}
          <span aria-hidden>＋</span>
        </summary>
        <div>
          <div className={s.manufacturerPanel}>
            <span>Manufacturer</span>
            <div
              className={s.brandFilters}
              role="group"
              aria-label="Manufacturer"
            >
              <button
                type="button"
                aria-pressed={value.brand === "all"}
                onClick={() => onChange({ ...value, brand: "all" })}
              >
                All manufacturers
              </button>
              {brands.map((brand) => (
                <button
                  type="button"
                  key={brand}
                  aria-pressed={value.brand === brand}
                  onClick={() => onChange({ ...value, brand })}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
          <label>
            Specification contains
            <input
              type="search"
              placeholder="e.g. ATX, 1 TB, SATA"
              value={value.spec}
              onChange={(e) => onChange({ ...value, spec: e.target.value })}
            />
          </label>
          <label>
            Maximum price (£)
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Any price"
              value={value.max}
              onChange={(e) => onChange({ ...value, max: e.target.value })}
            />
          </label>
        </div>
      </details>
      <div className={s.results}>
        <span aria-live="polite">
          {count} of {products.length} products
        </span>
        <button type="button" onClick={() => onChange(EMPTY_FILTERS)}>
          Reset filters
        </button>
      </div>
    </div>
  );
}
