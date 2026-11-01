"use client";
import { useState, useSyncExternalStore } from "react";
import type { BuilderProduct, BuilderSelection } from "@/lib/builder/types";
import { BuilderDialog } from "./BuilderDialog";
import { BuilderPhoto } from "./BuilderPhoto";
import { productName, productPrice } from "@/lib/builder/presentation";
import s from "./Builder.module.css";
const query = "(max-width:679px)";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
export function BuilderCompare({
  products,
  selection,
  onSelect,
  onRemove,
  onClose,
}: {
  products: BuilderProduct[];
  selection: BuilderSelection;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const [differences, setDifferences] = useState(false);
  const mobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
  const labels = [
    ...new Set(products.flatMap((p) => p.specs.map((spec) => spec.label))),
  ];
  const rows = labels
    .map((label) => ({
      label,
      values: products.map(
        (p) =>
          p.specs.find((spec) => spec.label === label)?.value ??
          "Not published",
      ),
    }))
    .filter((row) => !differences || new Set(row.values).size > 1);
  const select = (p: BuilderProduct) => (
    <button
      type="button"
      className={selection[p.category] === p.id ? s.selectedButton : s.primary}
      onClick={() => onSelect(p.id)}
    >
      {selection[p.category] === p.id ? "Selected" : "Select component"}{" "}
      <span aria-hidden>{selection[p.category] === p.id ? "✓" : "＋"}</span>
    </button>
  );
  return (
    <BuilderDialog title="Compare components" onClose={onClose} wide>
      <div className={s.compareIntro}>
        <p>
          Published specifications, side by side. Unreported values stay
          explicit.
        </p>
        <label>
          <input
            type="checkbox"
            checked={differences}
            onChange={(e) => setDifferences(e.target.checked)}
          />{" "}
          Show differences only
        </label>
      </div>
      {mobile ? (
        <div className={s.comparisonCards}>
          {products.map((p, index) => (
            <section key={p.id}>
              <button
                type="button"
                className={s.textButton}
                aria-label={`Remove ${p.name} from comparison`}
                onClick={() => onRemove(p.id)}
              >
                Remove ×
              </button>
              <div className={s.compareCardHeader}>
                <BuilderPhoto product={p} size="row" />
                <div>
                  <span className={s.kicker}>{p.brand}</span>
                  <h3>{productName(p)}</h3>
                  <strong>{productPrice(p)}</strong>
                </div>
              </div>
              <dl>
                {rows.map((row) => (
                  <div
                    key={row.label}
                    data-different={new Set(row.values).size > 1}
                  >
                    <dt>{row.label}</dt>
                    <dd>{row.values[index]}</dd>
                  </div>
                ))}
              </dl>
              {select(p)}
            </section>
          ))}
        </div>
      ) : (
        <div className={s.comparisonMatrix}>
          <table>
            <caption>
              Specification comparison · {products.length} products
            </caption>
            <thead>
              <tr>
                <th scope="col">Published specification</th>
                {products.map((p) => (
                  <th key={p.id} scope="col">
                    <button
                      type="button"
                      className={s.textButton}
                      aria-label={`Remove ${p.name} from comparison`}
                      onClick={() => onRemove(p.id)}
                    >
                      Remove ×
                    </button>
                    <BuilderPhoto product={p} size="row" />
                    <span className={s.kicker}>{p.brand}</span>
                    <h3>{productName(p)}</h3>
                    <strong>{productPrice(p)}</strong>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  data-different={new Set(row.values).size > 1}
                >
                  <th scope="row">{row.label}</th>
                  {row.values.map((value, i) => (
                    <td key={products[i]!.id}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Choose a product</td>
                {products.map((p) => (
                  <td key={p.id}>{select(p)}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </BuilderDialog>
  );
}
