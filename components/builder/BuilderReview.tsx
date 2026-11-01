"use client";
import { useEffect, useRef } from "react";
import {
  CATEGORY_INFO,
  GROUPS,
  type BuilderCategory,
} from "@/lib/builder/categories";
import { productById } from "@/lib/builder/catalogue";
import type { BuilderSelection } from "@/lib/builder/types";
import { formatPence } from "@/lib/pricing/currency";
import {
  demoSpecificationText,
  DEMO_NOTICE,
  type DemoBuild,
} from "@/lib/builder/demo";
import { BuilderPhoto } from "./BuilderPhoto";
import { productPrice, productName } from "@/lib/builder/presentation";
import s from "./Builder.module.css";
export function BuilderReview({
  selection,
  evaluation,
  onBack,
  onGoto,
  onShare,
}: {
  selection: BuilderSelection;
  evaluation: DemoBuild;
  onBack: () => void;
  onGoto: (c: BuilderCategory) => void;
  onShare: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const download = () => {
    const file = new Blob([demoSpecificationText(selection)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kazauk-build-specification.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section className={s.review}>
      <button type="button" className={s.textButton} onClick={onBack}>
        ← Return to component selection
      </button>
      <header className={s.reviewHeader}>
        <div>
          <p className={s.kicker}>KAZAUK / YOUR BUILD SHEET</p>
          <h2 ref={heading} tabIndex={-1}>
            Your specification.
          </h2>
          <p>
            {evaluation.covered}/{evaluation.required} essential selections
            covered · {Object.keys(selection).length} selections
          </p>
        </div>
        <div>
          <span>
            {evaluation.unpriced.length ? "Known subtotal" : "Component total"}
          </span>
          <strong>{formatPence(evaluation.totalPence)}</strong>
        </div>
      </header>
      <div className={s.reviewActions}>
        <button type="button" className={s.primary} onClick={download}>
          Download specification ↓
        </button>
        <button type="button" className={s.secondary} onClick={onShare}>
          Save & share ↗
        </button>
      </div>
      <div className={s.reviewState}>
        <strong>
          {evaluation.missing.length
            ? "Your selection in progress"
            : "Your essential selections are covered"}
        </strong>
        <p>{DEMO_NOTICE}</p>
      </div>
      {GROUPS.map((group, index) => {
        const cats = CATEGORY_INFO.filter(
          (c) => c.group === index && selection[c.id],
        );
        if (!cats.length) return null;
        return (
          <section className={s.reviewGroup} key={group.name}>
            <h3>{group.name}</h3>
            <ol>
              {cats.map((c) => {
                const p = productById(selection[c.id])!;
                return (
                  <li key={c.id}>
                    <BuilderPhoto product={p} size="thumb" />
                    <div>
                      <span className={s.kicker}>{c.label}</span>
                      <strong>{productName(p)}</strong>
                      <small>Snapshot: {p.captured}</small>
                    </div>
                    <span className={s.reviewItemPrice}>{productPrice(p)}</span>
                    <button
                      type="button"
                      className={s.secondary}
                      aria-label={`Edit ${c.label}`}
                      onClick={() => onGoto(c.id)}
                    >
                      Edit ↗
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
      {evaluation.missing.length ? (
        <section className={s.reviewMissing}>
          <h3>Complete your specification</h3>
          {evaluation.missing.map((c) => (
            <button type="button" key={c} onClick={() => onGoto(c)}>
              {c === "ssd"
                ? "Choose SSD or HDD"
                : `Choose ${CATEGORY_INFO.find((x) => x.id === c)!.label}`}{" "}
              ↗
            </button>
          ))}
        </section>
      ) : null}
      <p className={s.reviewDisclaimer}>
        Independent demonstration. This is not a quotation, an order or a stock
        reservation. Verify the complete specification with the manufacturers
        before purchasing. Delivery and assembly are excluded.
      </p>
    </section>
  );
}
