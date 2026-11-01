"use client";
import { useState } from "react";
import { categoryInfo } from "@/lib/builder/categories";
import type { BuilderProduct, BuilderSelection } from "@/lib/builder/types";
import { BuilderPhoto } from "./BuilderPhoto";
import { BuilderDialog } from "./BuilderDialog";
import { productName, productPrice, stockLabel } from "./BuilderProducts";
import s from "./Builder.module.css";
export function BuilderDetails({
  product,
  selection,
  onSelect,
  onCompare,
  compared,
  comparisonFull,
  onClose,
}: {
  product: BuilderProduct;
  selection: BuilderSelection;
  onSelect: () => void;
  onCompare: () => void;
  compared: boolean;
  comparisonFull: boolean;
  onClose: () => void;
}) {
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [tab, setTab] = useState("specs");

  return (
    <BuilderDialog title="Product details" onClose={onClose} wide>
      <div className={s.detailsHero}>
        <div>
          <button
            type="button"
            className={`${s.zoom} ${zoom ? s.zoomActive : ""}`}
            onClick={() => setZoom(!zoom)}
            aria-pressed={zoom}
            aria-label={zoom ? "Reduce product image" : "Enlarge product image"}
            disabled={!product.images.length}
          >
            <BuilderPhoto key={view} product={product} view={view} large />
          </button>
          <div className={s.galleryViews}>
            {product.images.map((image, i) => (
              <button
                type="button"
                key={image.src}
                aria-pressed={view === i}
                onClick={() => {
                  setView(i);
                  setZoom(false);
                }}
              >
                View {i + 1}
              </button>
            ))}
            {product.images.length ? (
              <span>Click image to {zoom ? "reduce" : "zoom"}</span>
            ) : null}
          </div>
        </div>
        <div className={s.detailsCopy}>
          <p className={s.kicker}>
            {product.brand} / {categoryInfo(product.category).label}
          </p>
          <h3>{productName(product)}</h3>
          <span className={s.model}>
            Model / SKU: {product.model ?? "Not captured"}
          </span>
          <p className={s.detailsPrice}>{productPrice(product)}</p>
          <p className={s.availability}>{stockLabel(product)}</p>

          <p className={s.detailsDescription}>
            {categoryInfo(product.category).description}
          </p>
          <div className={s.detailsActions}>
            <button
              type="button"
              className={
                selection[product.category] === product.id
                  ? s.selectedButton
                  : s.primary
              }
              onClick={onSelect}
            >
              {selection[product.category] === product.id
                ? "Selected ✓"
                : "Select component ＋"}
            </button>
            <button
              type="button"
              className={s.secondary}
              aria-pressed={compared}
              disabled={!compared && comparisonFull}
              onClick={onCompare}
            >
              {compared
                ? "Remove from comparison"
                : comparisonFull
                  ? "Comparison full (3)"
                  : "Add to comparison"}
            </button>
          </div>
        </div>
      </div>
      <div
        className={s.detailNavigation}
        role="group"
        aria-label="Product information"
      >
        {[
          ["specs", "Specifications"],
          ["guide", "Choosing & installation"],
          ["source", "Source & notes"],
        ].map(([key, label]) => (
          <button
            type="button"
            key={key}
            aria-pressed={tab === key}
            onClick={() => setTab(key!)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={s.detailBody}>
        {tab === "specs" ? (
          <dl className={s.specification}>
            {product.specs.length ? (
              product.specs.map((spec) => (
                <div key={spec.key}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))
            ) : (
              <div>
                <dt>Specification</dt>
                <dd>Not captured. Consult the exact product source.</dd>
              </div>
            )}
          </dl>
        ) : tab === "guide" ? (
          <div className={s.sourceInformation}>
            <p>{categoryInfo(product.category).tip}</p>
            <p>
              Demo combinations are unrestricted. Confirm the complete
              specification with the component manufacturers before purchasing.
            </p>
          </div>
        ) : (
          <div className={s.sourceInformation}>
            <p>
              {product.note ??
                "The original demonstration dataset is preserved without changes to prices or specifications."}
            </p>
            <dl>
              <div>
                <dt>Original product title</dt>
                <dd>{product.name}</dd>
              </div>
              <div>
                <dt>Data source</dt>
                <dd>
                  {product.origin === "original"
                    ? "Original KAZAUK demonstration snapshot"
                    : product.sourceUrl?.includes("pcgamingcases.co.uk")
                      ? "Separately researched retailer product"
                      : "Manufacturer catalogue reference"}
                </dd>
              </div>
              <div>
                <dt>Snapshot date</dt>
                <dd>{product.captured}</dd>
              </div>
              {product.imageVerification ? (
                <div>
                  <dt>Image verification</dt>
                  <dd>{product.imageVerification}</dd>
                </div>
              ) : null}
              <div>
                <dt>Image permission</dt>
                <dd>
                  {product.images.length
                    ? product.imagePermission
                    : "No verified usable image. The fallback is a category illustration."}
                </dd>
              </div>
            </dl>
            {product.imageSourcePage ? (
              <a
                href={product.imageSourcePage}
                target="_blank"
                rel="noreferrer"
              >
                Product photograph source ↗
              </a>
            ) : null}
            {product.sourceUrl ? (
              <a href={product.sourceUrl} target="_blank" rel="noreferrer">
                Open exact product source ↗
              </a>
            ) : (
              <p>Included with the specified boxed processor.</p>
            )}
            <p>
              Retailer photographs may show additional demonstration hardware.
              Only the selected catalogue items contribute to this
              specification.
            </p>
          </div>
        )}
      </div>
    </BuilderDialog>
  );
}
