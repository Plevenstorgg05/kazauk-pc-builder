"use client";
import { useRef, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
  type AnyPart,
} from "@/lib/catalog/schema";
import { findPart, partsIn } from "@/lib/catalog/normalize";
import { evaluateCandidate } from "@/lib/compatibility/engine";
import { formatPence } from "@/lib/pricing/currency";
import { GUIDES } from "@/lib/configurator/education";
import { buildURL } from "@/lib/configurator/build-storage";
import { FILTER_SPEC, manufacturer } from "@/lib/configurator/products";
import { useBuildConfigurator } from "@/hooks/useBuildConfigurator";
import { ProductCard } from "./ProductCard";
import { BuildSummary } from "./BuildSummary";
import { coveredCount } from "@/lib/configurator/progress";
import { BuildReview } from "./BuildReview";
import { CategoryNav } from "./CategoryNav";
import { CompatibilityDetails } from "./CompatibilityDetails";
import { ProductDetails } from "./ProductDetails";
import { Comparison } from "./Comparison";
import { Dialog } from "./Dialog";
import s from "./Workspace.module.css";
const initialFilters = {
  query: "",
  brand: "all",
  spec: "all",
  maxPrice: "",
  sort: "catalogue",
  compatible: false,
};
export function Configurator() {
  const cfg = useBuildConfigurator();
  const { selection, evaluation, active } = cfg;
  const [reviewing, setReviewing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [detail, setDetail] = useState<AnyPart | null>(null);
  const [comparing, setComparing] = useState(false);
  const [compared, setCompared] = useState<string[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [notice, setNotice] = useState("");
  const [shareFallback, setShareFallback] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const goto = (category: Category) => {
    cfg.goto(category);
    setFilters(initialFilters);
    setCompared([]);
    setComparing(false);
    setDetail(null);
    setReviewing(false);
    setSheetOpen(false);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const parts = partsIn(active) as AnyPart[];
  const brands = [...new Set(parts.map(manufacturer))];
  const specKey = FILTER_SPEC[active].key;
  const specValue = (p: AnyPart) => {
    const v = (p as unknown as Record<string, unknown>)[specKey];
    return Array.isArray(v) ? v.map(String) : [String(v)];
  };
  const specOptions = [...new Set(parts.flatMap(specValue))];
  const candidates = parts.map((part) => ({
    part,
    ...evaluateCandidate(selection, active, part.id),
  }));
  const displayed = candidates
    .filter(
      ({ part, status }) =>
        (part.name.toLowerCase().includes(filters.query.toLowerCase()) ||
          part.id.toLowerCase().includes(filters.query.toLowerCase())) &&
        (filters.brand === "all" || manufacturer(part) === filters.brand) &&
        (filters.spec === "all" || specValue(part).includes(filters.spec)) &&
        (!filters.maxPrice || part.price_gbp <= Number(filters.maxPrice)) &&
        (!filters.compatible || status === "compatible"),
    )
    .sort((a, b) =>
      filters.sort === "low"
        ? a.part.price_gbp - b.part.price_gbp
        : filters.sort === "high"
          ? b.part.price_gbp - a.part.price_gbp
          : filters.sort === "name"
            ? a.part.name.localeCompare(b.part.name)
            : 0,
    );
  const toggleCompare = (id: string) => {
    if (compared.includes(id)) setCompared(compared.filter((x) => x !== id));
    else if (compared.length < 3) setCompared([...compared, id]);
    else
      setNotice("Compare up to three components. Remove one to add another.");
  };
  const select = (id: string) => {
    cfg.select(active, id);
    setNotice("Component selected. Build total and compatibility updated.");
  };
  const share = async () => {
    const url = buildURL(selection, window.location.href);
    try {
      await navigator.clipboard.writeText(url);
      setNotice(
        "Build link copied. Anyone with the link can restore these selections.",
      );
    } catch {
      setShareFallback(url);
    }
  };
  const review = () => {
    setSheetOpen(false);
    setReviewing(true);
  };
  const summary = (
    <BuildSummary
      selection={selection}
      evaluation={evaluation}
      acknowledged={cfg.acknowledged}
      onAcknowledge={cfg.acknowledge}
      onGoto={goto}
      onClear={cfg.clear}
      onReview={review}
      onInspect={review}
      onReset={() => setResetting(true)}
      onShare={() => void share()}
      storageAvailable={cfg.storageAvailable}
    />
  );
  const guide = GUIDES[active];
  const index = CATEGORIES.indexOf(active);
  const selected = selection[active] ? findPart(selection[active]!) : undefined;
  return (
    <div className={s.configurator}>
      <div
        role="status"
        aria-live="polite"
        className={notice ? s.notice : s.srOnly}
      >
        {notice}
        {notice ? (
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        ) : null}
      </div>
      {reviewing ? (
        <BuildReview
          selection={selection}
          evaluation={evaluation}
          onBack={() => {
            setReviewing(false);
            requestAnimationFrame(() => heading.current?.focus());
          }}
          onEdit={goto}
          onShare={() => void share()}
        />
      ) : (
        <>
          <div className={s.workspace}>
            <CategoryNav
              selection={selection}
              active={active}
              evaluation={evaluation}
              onGoto={goto}
            />
            <div className={s.selectionArea}>
              <div className={s.categoryHeading}>
                <div>
                  <span className={s.eyebrow}>
                    Component {String(index + 1).padStart(2, "0")} /{" "}
                    {String(CATEGORIES.length).padStart(2, "0")}
                  </span>
                  <h2 ref={heading} id="category-heading" tabIndex={-1}>
                    {CATEGORY_LABELS[active]}
                    <span>.</span>
                  </h2>
                </div>
                <span className={s.optionCount}>
                  {parts.length} considered options
                </span>
              </div>
              <div className={s.categoryIntro}>
                <h3>{guide.title}</h3>
                <p>{guide.intro}</p>
                <details className={s.categoryGuide}>
                  <summary>
                    What should I look for? <span aria-hidden>＋</span>
                  </summary>
                  <div>
                    <p>{guide.tip}</p>
                    <dl>
                      {guide.terms.map(([term, definition]) => (
                        <div key={term}>
                          <dt>{term}</dt>
                          <dd>{definition}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className={s.snapshot}>
                      General guidance. Individual product specifications come
                      only from the supplied catalogue.
                    </p>
                  </div>
                </details>
              </div>
              <form
                className={s.filters}
                onSubmit={(e) => e.preventDefault()}
                aria-label="Filter components"
              >
                <label className={s.search}>
                  <span aria-hidden>⌕</span>
                  <input
                    type="search"
                    placeholder={`Find your ${CATEGORY_LABELS[active].toLowerCase()}…`}
                    aria-label="Search components"
                    value={filters.query}
                    onChange={(e) =>
                      setFilters({ ...filters, query: e.target.value })
                    }
                  />
                </label>
                <label className={s.sortLabel}>
                  Sort
                  <select
                    aria-label="Sort components"
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters({ ...filters, sort: e.target.value })
                    }
                  >
                    <option value="catalogue">Catalogue order</option>
                    <option value="low">Price: low to high</option>
                    <option value="high">Price: high to low</option>
                    <option value="name">Name: A–Z</option>
                  </select>
                </label>
                <details className={s.filterDisclosure}>
                  <summary>
                    Refine selection <span aria-hidden>＋</span>
                  </summary>
                  <div className={s.filterFields}>
                    <label>
                      Manufacturer
                      <select
                        value={filters.brand}
                        onChange={(e) =>
                          setFilters({ ...filters, brand: e.target.value })
                        }
                      >
                        <option value="all">All manufacturers</option>
                        {brands.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {FILTER_SPEC[active].label}
                      <select
                        value={filters.spec}
                        onChange={(e) =>
                          setFilters({ ...filters, spec: e.target.value })
                        }
                      >
                        <option value="all">All options</option>
                        {specOptions.map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Maximum price (£)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="No limit"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, maxPrice: e.target.value })
                        }
                      />
                    </label>
                    <label className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.compatible}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            compatible: e.target.checked,
                          })
                        }
                      />{" "}
                      Passing available checks only
                    </label>
                    <p className={s.filterHelp}>
                      Passing available checks does not establish full
                      compatibility. Unchecked parts and unknowns are hidden by
                      this filter.
                    </p>
                  </div>
                </details>
              </form>
              <div className={s.resultsHeading}>
                <span aria-live="polite">
                  {displayed.length} of {parts.length} options
                </span>
                <button
                  type="button"
                  className={s.textButton}
                  onClick={() => setFilters(initialFilters)}
                >
                  Clear filters
                </button>
              </div>
              <section
                aria-labelledby="category-heading"
                className={s.productList}
              >
                {displayed.map(({ part, status, reasons }) => (
                  <ProductCard
                    key={part.id}
                    part={part}
                    category={active}
                    selected={selection[active] === part.id}
                    status={status}
                    reasons={reasons}
                    onSelect={() => select(part.id)}
                    onDetails={() => setDetail(part)}
                    compared={compared.includes(part.id)}
                    onCompare={() => toggleCompare(part.id)}
                    delta={
                      selected
                        ? Math.round(
                            (part.price_gbp - selected.price_gbp) * 100,
                          ) / 100
                        : null
                    }
                  />
                ))}
                {!displayed.length ? (
                  <div className={s.noResults}>
                    <h3>No components match these filters.</h3>
                    <p>
                      Try a wider price range or include unchecked components.
                    </p>
                    <button
                      type="button"
                      className={s.secondaryButton}
                      onClick={() => setFilters(initialFilters)}
                    >
                      Reset filters
                    </button>
                  </div>
                ) : null}
              </section>
              {compared.length ? (
                <div className={s.compareTray}>
                  <span>{compared.length} of 3 selected to compare</span>
                  <button
                    type="button"
                    className={s.secondaryButton}
                    onClick={() => setCompared([])}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className={s.primaryButton}
                    disabled={compared.length < 2}
                    onClick={() => setComparing(true)}
                  >
                    Compare {compared.length} components ↗
                  </button>
                </div>
              ) : null}
              <div className={s.stepNavigation}>
                <button
                  type="button"
                  className={s.textButton}
                  disabled={index === 0}
                  onClick={() => goto(CATEGORIES[index - 1]!)}
                >
                  ← Previous component
                </button>
                <button
                  type="button"
                  className={s.secondaryButton}
                  onClick={() =>
                    index === CATEGORIES.length - 1
                      ? review()
                      : goto(CATEGORIES[index + 1]!)
                  }
                >
                  {index === CATEGORIES.length - 1
                    ? "Inspect build"
                    : "Next: " + CATEGORY_LABELS[CATEGORIES[index + 1]!]}{" "}
                  ↗
                </button>
              </div>
              {evaluation.results.some((r) => r.status !== "compatible") ? (
                <section
                  className={s.issues}
                  aria-label="Compatibility findings"
                >
                  <div className={s.sectionHeading}>
                    The compatibility check
                  </div>
                  {evaluation.results
                    .filter((r) => r.status !== "compatible")
                    .map((r) => (
                      <div className={s.finding} key={r.ruleId}>
                        <CompatibilityDetails result={r} />
                        <div className={s.resolutionLinks}>
                          {r.categories.map((c) => (
                            <button
                              type="button"
                              className={s.textButton}
                              key={c}
                              onClick={() => goto(c)}
                            >
                              Review {CATEGORY_LABELS[c]} ↗
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </section>
              ) : null}
              <section className={s.faqs}>
                <span className={s.eyebrow}>A little more clarity</span>
                <h3>Good questions. Clear answers.</h3>
                {guide.faqs.map(([q, a]) => (
                  <details className={s.disclosure} key={q}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </section>
              <div className={s.tabletSummary}>{summary}</div>
            </div>
            <div className={s.desktopSummary} data-lenis-prevent>
              {summary}
            </div>
          </div>
          <div className={s.mobileBar}>
            <div>
              <span>{coveredCount(selection)}/7 covered</span>
              <strong>{formatPence(evaluation.totalPence)}</strong>
            </div>
            <button
              type="button"
              className={s.primaryButton}
              onClick={() => setSheetOpen(true)}
            >
              Your build <span aria-hidden>↗</span>
            </button>
          </div>
        </>
      )}
      {sheetOpen ? (
        <Dialog title="Your build overview" onClose={() => setSheetOpen(false)}>
          {summary}
        </Dialog>
      ) : null}
      {detail ? (
        <ProductDetails
          key={detail.id}
          part={detail}
          category={active}
          selection={selection}
          onClose={() => setDetail(null)}
          onSelect={() => select(detail.id)}
          onCompare={() => toggleCompare(detail.id)}
          compared={compared.includes(detail.id)}
        />
      ) : null}
      {comparing && compared.length >= 2 ? (
        <Comparison
          parts={compared.map((id) => findPart(id)!)}
          category={active}
          selection={selection}
          onSelect={select}
          onRemove={(id) => {
            const next = compared.filter((x) => x !== id);
            setCompared(next);
            if (next.length < 2) setComparing(false);
          }}
          onClose={() => setComparing(false)}
        />
      ) : null}
      {resetting ? (
        <Dialog title="Start a new build?" onClose={() => setResetting(false)}>
          <div className={s.confirmBody}>
            <p>
              This removes your selected components and replaces the saved build
              on this device. Copy a build link first if you want to keep it.
            </p>
            <div className={s.detailActions}>
              <button
                type="button"
                className={s.secondaryButton}
                onClick={() => setResetting(false)}
              >
                Keep my build
              </button>
              <button
                type="button"
                className={s.primaryButton}
                onClick={() => {
                  cfg.reset();
                  setResetting(false);
                  setSheetOpen(false);
                  setFilters(initialFilters);
                  setCompared([]);
                  setNotice("Build reset. Your workspace is ready.");
                }}
              >
                Reset build
              </button>
            </div>
          </div>
        </Dialog>
      ) : null}
      {shareFallback ? (
        <Dialog title="Share your build" onClose={() => setShareFallback("")}>
          <div className={s.confirmBody}>
            <p>
              Copy this link to restore the same selections on another device.
            </p>
            <label>
              Build link
              <textarea
                readOnly
                value={shareFallback}
                onFocus={(e) => e.target.select()}
              />
            </label>
          </div>
        </Dialog>
      ) : null}
      <div className={s.workspaceFooter}>
        <span>Built around your choices.</span>
        <span>30 components · 7 categories · GBP snapshot</span>
        <button type="button" className={s.textButton} onClick={review}>
          Inspect specification ↗
        </button>
      </div>
    </div>
  );
}
