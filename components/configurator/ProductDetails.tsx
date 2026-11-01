"use client";
import { useState } from "react";
import type { AnyPart, Category } from "@/lib/catalog/schema";
import type { Selection } from "@/lib/compatibility/types";
import { evaluateCandidate } from "@/lib/compatibility/engine";
import { formatPounds } from "@/lib/pricing/currency";
import { STOCK_LABELS } from "@/lib/catalog/normalize";
import {
  displayName,
  manufacturer,
  specsFor,
} from "@/lib/configurator/products";
import manifest from "@/lib/configurator/product-images.json";
import { Dialog } from "./Dialog";
import { ProductMedia, imageCount } from "./ProductMedia";
import { CompatibilityDetails } from "./CompatibilityDetails";
import { CompatibilityIndicator } from "./CompatibilityIndicator";
import s from "./Workspace.module.css";
export function ProductDetails({
  part,
  category,
  selection,
  onClose,
  onSelect,
  onCompare,
  compared,
}: {
  part: AnyPart;
  category: Category;
  selection: Selection;
  onClose: () => void;
  onSelect: () => void;
  onCompare: () => void;
  compared: boolean;
}) {
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [tab, setTab] = useState<"specs" | "fit" | "source">("specs");
  const evaluation = evaluateCandidate(selection, category, part.id);
  const media = manifest.find((p) => p.productId === part.id);
  const count = imageCount(part.id);
  return (
    <Dialog title="Component details" onClose={onClose} wide>
      <div className={s.detailsLayout}>
        <div className={s.gallery}>
          <button
            type="button"
            onClick={() => setZoom(!zoom)}
            className={`${s.zoomMedia} ${zoom ? s.zoomed : ""}`}
            aria-label={zoom ? "Reduce image" : "Enlarge image"}
            disabled={!count}
          >
            <ProductMedia
              key={`${part.id}-${view}`}
              part={part}
              category={category}
              large
              index={view}
            />
          </button>
          <div className={s.galleryControls}>
            {count > 1
              ? Array.from({ length: count }, (_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      setView(i);
                      setZoom(false);
                    }}
                    aria-pressed={i === view}
                  >
                    View {i + 1}
                  </button>
                ))
              : null}
            {count ? (
              <span>Click image to {zoom ? "reduce" : "enlarge"}</span>
            ) : null}
          </div>
        </div>
        <div className={s.detailsInfo}>
          <p className={s.eyebrow}>{manufacturer(part)} / Component study</p>
          <h3>{displayName(part)}</h3>
          <p className={s.detailPrice}>
            {part.price_gbp === 0 ? "Included" : formatPounds(part.price_gbp)}
          </p>
          <p className={s.muted}>
            {STOCK_LABELS[part.stock]} · Snapshot availability
          </p>
          {evaluation.status ? (
            <CompatibilityIndicator status={evaluation.status} />
          ) : (
            <p className={s.muted}>
              Select related components to evaluate compatibility.
            </p>
          )}
          <div className={s.detailActions}>
            <button
              type="button"
              className={s.primaryButton}
              onClick={onSelect}
            >
              {selection[category] === part.id
                ? "Selected ✓"
                : "Select component"}
            </button>
            <button
              type="button"
              className={s.secondaryButton}
              onClick={onCompare}
              aria-pressed={compared}
            >
              {compared ? "Remove comparison" : "Add to comparison"}
            </button>
          </div>
          <p className={s.snapshot}>
            Historical component price. No order is placed.
          </p>
        </div>
      </div>
      <div
        className={s.detailTabs}
        role="tablist"
        aria-label="Product information"
        onKeyDown={(event) => {
          const tabs = ["specs", "fit", "source"] as const;
          const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
          if (!keys.includes(event.key)) return;
          event.preventDefault();
          const current = tabs.indexOf(tab);
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? 2
                : (current + (event.key === "ArrowRight" ? 1 : 2)) % 3;
          setTab(tabs[next]!);
          event.currentTarget
            .querySelectorAll<HTMLButtonElement>('[role="tab"]')
            [next]?.focus();
        }}
      >
        {(["specs", "fit", "source"] as const).map((t) => (
          <button
            type="button"
            role="tab"
            id={`detail-${t}`}
            aria-controls={`panel-${t}`}
            key={t}
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
          >
            {t === "specs"
              ? "Technical specification"
              : t === "fit"
                ? "Compatibility"
                : "Source & imagery"}
          </button>
        ))}
      </div>
      <div
        className={s.detailBody}
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`detail-${tab}`}
      >
        {tab === "specs" ? (
          <dl className={s.specTable}>
            {specsFor(category, part).map((spec) => (
              <div key={spec.key}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        ) : tab === "fit" ? (
          <div className={s.findings}>
            {evaluation.reasons.length ? (
              evaluation.reasons.map((r) => (
                <CompatibilityDetails key={r.ruleId} result={r} />
              ))
            ) : (
              <p>
                {evaluation.status === "compatible"
                  ? "All checks that currently apply to this component pass. Additional constraints outside the dataset still need manual verification."
                  : "Choose related components to run checks. An unchecked part is not confirmed compatible."}
              </p>
            )}
          </div>
        ) : (
          <>
            <p>{part.source}</p>
            {part.demo_note ? (
              <p className={s.sourceNote}>{part.demo_note}</p>
            ) : null}
            {part.url ? (
              <a
                className={s.sourceLink}
                href={part.url}
                target="_blank"
                rel="noreferrer"
              >
                Open original product listing ↗
              </a>
            ) : (
              <p>Supplied with the specified boxed processor.</p>
            )}
            {media?.manufacturerPage ? (
              <p>
                <a
                  className={s.sourceLink}
                  href={media.manufacturerPage}
                  target="_blank"
                  rel="noreferrer"
                >
                  Manufacturer specifications ↗
                </a>
              </p>
            ) : null}
            <p className={s.snapshot}>
              {media?.status === "permitted"
                ? "Product photography reproduced with permission confirmed by the project owner. Retailer photos may include demonstration hardware; only selected catalogue parts are included."
                : "Product photography is unavailable or awaiting exact-model verification. The category illustration is not a photograph of this SKU."}
            </p>
          </>
        )}
      </div>
    </Dialog>
  );
}
