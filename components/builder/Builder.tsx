"use client";
import { useRef, useState } from "react";
import { useBuilder } from "@/hooks/useBuilder";
import {
  CATEGORY_IDS,
  categoryInfo,
  GROUPS,
  type BuilderCategory,
} from "@/lib/builder/categories";
import { PRODUCTS, productsIn, productById } from "@/lib/builder/catalogue";
import type { BuilderProduct } from "@/lib/builder/types";
import { DEMO_NOTICE } from "@/lib/builder/demo";
import { shareBuild } from "@/lib/builder/storage";
import { formatPence } from "@/lib/pricing/currency";
import { BuilderNav } from "./BuilderNav";
import { BuilderFilters, EMPTY_FILTERS } from "./BuilderFilters";
import { BuilderProducts, productPrice, productName } from "./BuilderProducts";
import { BuilderSheet } from "./BuilderSheet";
import { BuilderHelp } from "./BuilderHelp";
import { BuilderDetails } from "./BuilderDetails";
import { BuilderCompare } from "./BuilderCompare";
import { BuilderReview } from "./BuilderReview";
import { BuilderDialog } from "./BuilderDialog";
import { HardwareIllustration } from "@/components/media/HardwareIllustration";
import s from "./Builder.module.css";
export function Builder() {
  const cfg = useBuilder();
  const { active, selection, evaluation } = cfg;
  const category = categoryInfo(active);
  const index = CATEGORY_IDS.indexOf(active);
  const caseOrder = [
    "case-ionz-kz-900-v2",
    "case-ionz-apex-vision-w",
    "case-ionz-kz-z-v2",
    "research-case-wh-case-msiforge112r-black",
  ];
  const options = [...productsIn(active)].sort((a, b) =>
    active === "case"
      ? (caseOrder.indexOf(a.id) < 0 ? 100 : caseOrder.indexOf(a.id)) -
        (caseOrder.indexOf(b.id) < 0 ? 100 : caseOrder.indexOf(b.id))
      : 0,
  );
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [compared, setCompared] = useState<string[]>([]);
  const [detail, setDetail] = useState<BuilderProduct | null>(null);
  const [comparison, setComparison] = useState(false);
  const [review, setReview] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [reset, setReset] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const linkField = useRef<HTMLTextAreaElement>(null);
  const goto = (id: BuilderCategory) => {
    cfg.goto(id);
    setFilters(EMPTY_FILTERS);
    setCompared([]);
    setComparison(false);
    setDetail(null);
    setSheet(false);
    setReview(false);
    setNotice("");
    requestAnimationFrame(() => heading.current?.focus());
  };
  const choose = (id: string) => {
    cfg.select(active, id);
    setNotice(
      `${category.label} selected. Your specification has been updated.`,
    );
  };
  const toggleCompare = (id: string) => {
    if (compared.includes(id)) setCompared(compared.filter((x) => x !== id));
    else if (compared.length < 3) setCompared([...compared, id]);
    else setNotice("Compare up to three products. Remove one to add another.");
  };
  const share = () => {
    setCopied(false);
    setSharing(true);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareBuild(selection, location.href));
      setCopied(true);
    } catch {
      linkField.current?.focus();
      linkField.current?.select();
      setNotice("Select and copy the build link from the field.");
    }
  };
  const inspect = () => {
    setSheet(false);
    setReview(true);
  };
  const selected = productById(selection[active]);
  const filtered = options
    .filter(
      (p) =>
        [p.name, p.model ?? "", p.brand]
          .join(" ")
          .toLowerCase()
          .includes(filters.query.trim().toLowerCase()) &&
        p.specs
          .map((s) => s.value)
          .join(" ")
          .toLowerCase()
          .includes(filters.spec.trim().toLowerCase()) &&
        (filters.brand === "all" || p.brand === filters.brand) &&
        (!filters.max || (p.price !== null && p.price <= Number(filters.max))),
    )
    .sort((a, b) =>
      filters.sort === "low"
        ? (a.price ?? Infinity) - (b.price ?? Infinity)
        : filters.sort === "high"
          ? (b.price ?? -Infinity) - (a.price ?? -Infinity)
          : filters.sort === "name"
            ? a.name.localeCompare(b.name)
            : 0,
    );
  const sheetContent = (
    <BuilderSheet
      selection={selection}
      evaluation={evaluation}
      onGoto={goto}
      onRemove={cfg.clear}
      onReview={inspect}
      onReset={() => setReset(true)}
      onShare={share}
      saved={cfg.hydrated && cfg.storageAvailable}
      restoring={!cfg.hydrated}
    />
  );
  return (
    <fieldset
      className={s.workspace}
      disabled={!cfg.hydrated}
      aria-busy={!cfg.hydrated}
    >
      <div className={s.builderHeading}>
        <div>
          <span className={s.kicker}>KAZAUK / CUSTOM PC STUDIO</span>
          <h1>
            Build your PC<span>.</span>
          </h1>
        </div>
        <div className={s.builderHeadingAside}>
          <span>
            {PRODUCTS.length} catalogue products / {CATEGORY_IDS.length}{" "}
            categories
          </span>
          <button type="button" className={s.secondary} onClick={share}>
            Save & share ↗
          </button>
        </div>
      </div>
      <p className={s.demoNotice}>
        <span>DEMO MODE</span>
        {DEMO_NOTICE}
      </p>
      <div className={s.notification} role="status" aria-live="polite">
        {notice ? (
          <>
            ✓ {notice}
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </>
        ) : null}
      </div>
      {review ? (
        <BuilderReview
          selection={selection}
          evaluation={evaluation}
          onBack={() => {
            setReview(false);
            requestAnimationFrame(() => heading.current?.focus());
          }}
          onGoto={goto}
          onShare={share}
        />
      ) : (
        <>
          <div className={s.layout}>
            <BuilderNav active={active} selection={selection} onGoto={goto} />
            <section className={s.catalogue} aria-labelledby="builder-category">
              <div className={s.categoryHeading}>
                <div>
                  <p className={s.kicker}>
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {GROUPS[category.group]!.name.toUpperCase()}
                  </p>
                  <h2 ref={heading} id="builder-category" tabIndex={-1}>
                    {active === "case" ? "Choose your case" : category.label}
                    <span>{category.essential ? "ESSENTIAL" : "OPTIONAL"}</span>
                  </h2>
                </div>
                <button
                  type="button"
                  className={s.helpLink}
                  onClick={() =>
                    document.getElementById("component-help")?.scrollIntoView({
                      block: "start",
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches
                        ? "instant"
                        : "smooth",
                    })
                  }
                >
                  Help choosing <span aria-hidden>?</span>
                </button>
              </div>
              <p className={s.categoryDescription}>{category.description}</p>
              {selected ? (
                <div className={s.currentSelection}>
                  <span>YOUR SELECTION</span>
                  <strong>{productName(selected)}</strong>
                  <span>{productPrice(selected)}</span>
                  <button
                    type="button"
                    onClick={() =>
                      goto(
                        CATEGORY_IDS[
                          Math.min(index + 1, CATEGORY_IDS.length - 1)
                        ]!,
                      )
                    }
                  >
                    {active === "case"
                      ? "Continue to processor"
                      : "Next component"}{" "}
                    →
                  </button>
                </div>
              ) : null}
              {options.length ? (
                <>
                  <BuilderFilters
                    products={options}
                    value={filters}
                    onChange={setFilters}
                    count={filtered.length}
                  />
                  {filtered.length ? (
                    <BuilderProducts
                      products={filtered}
                      selected={selected}
                      onSelect={choose}
                      onInspect={setDetail}
                      onCompare={toggleCompare}
                      compared={compared}
                      visual={
                        active === "case" ||
                        active === "gpu" ||
                        active === "monitor"
                      }
                    />
                  ) : (
                    <div className={s.empty}>
                      <h3>No matching products.</h3>
                      <p>
                        Try a different search, manufacturer, specification or
                        price range.
                      </p>
                      <button
                        type="button"
                        className={s.secondary}
                        onClick={() => setFilters(EMPTY_FILTERS)}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className={s.emptyCatalogue}>
                  <div className={s.emptyCategoryIllustration}>
                    <HardwareIllustration category={active} />
                    <span>ILLUSTRATIVE / CATEGORY</span>
                  </div>
                  <div>
                    <span className={s.kicker}>
                      CATALOGUE READY / PRODUCTS PENDING
                    </span>
                    <h3>{category.label}</h3>
                    <p>No products are listed in this demo category yet.</p>
                    <p>
                      {category.essential
                        ? "An internal SSD can fulfil the storage requirement."
                        : "This category is optional. You can continue without selecting anything."}
                    </p>
                    <button
                      type="button"
                      className={s.secondary}
                      onClick={() =>
                        goto(
                          CATEGORY_IDS[
                            Math.min(index + 1, CATEGORY_IDS.length - 1)
                          ]!,
                        )
                      }
                    >
                      Continue to{" "}
                      {
                        categoryInfo(
                          CATEGORY_IDS[
                            Math.min(index + 1, CATEGORY_IDS.length - 1)
                          ]!,
                        ).label
                      }{" "}
                      ↗
                    </button>
                  </div>
                </div>
              )}
              {compared.length ? (
                <div className={s.compareBar}>
                  <div>
                    <span className={s.kicker}>COMPARISON</span>
                    <strong>{compared.length} / 3 products</strong>
                  </div>
                  <button
                    type="button"
                    className={s.textButton}
                    onClick={() => setCompared([])}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className={s.primary}
                    disabled={compared.length < 2}
                    onClick={() => setComparison(true)}
                  >
                    Compare {compared.length} products ↗
                  </button>
                </div>
              ) : null}
              <div className={s.categoryFooter}>
                <button
                  type="button"
                  className={s.textButton}
                  disabled={index === 0}
                  onClick={() => goto(CATEGORY_IDS[index - 1]!)}
                >
                  ← Previous component
                </button>
                <button
                  type="button"
                  className={s.secondary}
                  onClick={() =>
                    index === CATEGORY_IDS.length - 1
                      ? inspect()
                      : goto(CATEGORY_IDS[index + 1]!)
                  }
                >
                  {index === CATEGORY_IDS.length - 1
                    ? "Review specification"
                    : `Next: ${categoryInfo(CATEGORY_IDS[index + 1]!).label}`}{" "}
                  →
                </button>
              </div>
              <div id="component-help" className={s.helpAnchor}>
                <BuilderHelp category={active} />
              </div>
              <div className={s.tabletSheet}>{sheetContent}</div>
            </section>
            <div className={s.desktopSheet} data-lenis-prevent>
              {sheetContent}
            </div>
          </div>
          <div className={s.mobileTotal}>
            <div>
              <span>
                {evaluation.covered}/{evaluation.required} essentials ·{" "}
                {Object.keys(selection).length} selected
              </span>
              <strong>
                {formatPence(evaluation.totalPence)}
                {evaluation.unpriced.length ? <small> + quote</small> : null}
              </strong>
            </div>
            <button
              type="button"
              className={s.primary}
              onClick={() => setSheet(true)}
            >
              Your build ↗
            </button>
          </div>
        </>
      )}
      {detail ? (
        <BuilderDetails
          key={detail.id}
          product={detail}
          selection={selection}
          onSelect={() => choose(detail.id)}
          onCompare={() => toggleCompare(detail.id)}
          compared={compared.includes(detail.id)}
          comparisonFull={compared.length >= 3}
          onClose={() => setDetail(null)}
        />
      ) : null}
      {comparison && compared.length >= 2 ? (
        <BuilderCompare
          products={compared.map((id) => productById(id)!)}
          selection={selection}
          onSelect={choose}
          onRemove={(id) => {
            const next = compared.filter((x) => x !== id);
            setCompared(next);
            if (next.length < 2) setComparison(false);
          }}
          onClose={() => setComparison(false)}
        />
      ) : null}
      {sheet ? (
        <BuilderDialog
          title="Your build overview"
          onClose={() => setSheet(false)}
        >
          {sheetContent}
        </BuilderDialog>
      ) : null}
      {reset ? (
        <BuilderDialog
          title="Reset your build?"
          onClose={() => setReset(false)}
        >
          <div className={s.dialogBody}>
            <p>
              This removes your selections and replaces the saved build on this
              device. Keep a share link first if you want to retain this
              specification.
            </p>
            <div className={s.dialogActions}>
              <button
                type="button"
                className={s.secondary}
                onClick={() => setReset(false)}
              >
                Keep my build
              </button>
              <button
                type="button"
                className={s.primary}
                onClick={() => {
                  cfg.reset();
                  setReset(false);
                  setSheet(false);
                  setFilters(EMPTY_FILTERS);
                  setCompared([]);
                  setNotice("Build reset. Choose a case to start again.");
                }}
              >
                Reset build
              </button>
            </div>
          </div>
        </BuilderDialog>
      ) : null}
      {sharing ? (
        <BuilderDialog
          title="Save & share your build"
          onClose={() => setSharing(false)}
        >
          <div className={s.dialogBody}>
            <p>
              {cfg.storageAvailable
                ? "Your selections are saved automatically on this device."
                : "Local saving is unavailable in this browser."}{" "}
              This link restores the selected hardware on another device.
            </p>
            <label className={s.shareField}>
              Your configuration link
              <textarea
                ref={linkField}
                readOnly
                value={shareBuild(
                  selection,
                  typeof location === "undefined"
                    ? "http://localhost:3000/configure"
                    : location.href,
                )}
                onFocus={(e) => e.target.select()}
              />
            </label>
            <button
              type="button"
              className={s.primary}
              onClick={() => void copy()}
            >
              {copied ? "Link copied ✓" : "Copy build link ↗"}
            </button>
            <p className={s.finePrint}>
              Shared builds contain product IDs only. Prices and availability
              remain source snapshots. Restoring a shared build replaces
              selections saved on that device.
            </p>
          </div>
        </BuilderDialog>
      ) : null}
    </fieldset>
  );
}
