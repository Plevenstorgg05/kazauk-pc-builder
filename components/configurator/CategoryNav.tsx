"use client";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
} from "@/lib/catalog/schema";
import { findPart } from "@/lib/catalog/normalize";
import type { BuildEvaluation, Selection } from "@/lib/compatibility/types";
import { CategoryIcon } from "./CategoryIcon";
import s from "./Workspace.module.css";
export function CategoryNav({
  selection,
  active,
  evaluation,
  onGoto,
}: {
  selection: Selection;
  active: Category;
  evaluation: BuildEvaluation;
  onGoto: (c: Category) => void;
}) {
  const cpu = selection.cpu ? findPart(selection.cpu) : undefined;
  return (
    <nav className={s.categoryNav} aria-label="Component categories">
      <p className={s.eyebrow}>
        The components <span>01—07</span>
      </p>
      <ol>
        {CATEGORIES.map((c, i) => {
          const included =
            c === "cooler" &&
            !selection.cooler &&
            cpu &&
            "cooler_included" in cpu &&
            cpu.cooler_included;
          const hits = evaluation.results.filter(
            (r) => r.categories.includes(c) && r.status !== "compatible",
          );
          const state = hits.some((r) => r.status === "incompatible")
            ? "Conflict"
            : hits.length
              ? "Check needed"
              : selection[c]
                ? "Selected"
                : included
                  ? "Included"
                  : "Choose component";
          return (
            <li key={c}>
              <button
                type="button"
                onClick={() => onGoto(c)}
                aria-current={active === c ? "step" : undefined}
                className={active === c ? s.categoryActive : ""}
              >
                <span className={s.stepNumber}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <CategoryIcon category={c} />
                <span className={s.categoryText}>
                  <strong>{CATEGORY_LABELS[c]}</strong>
                  <small className={hits.length ? s.attention : ""}>
                    {state}
                  </small>
                </span>
                <span className={s.stepMark} aria-hidden>
                  {selection[c] || included ? "✓" : "↗"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className={s.railNote}>
        <span aria-hidden>↳</span>
        <p>
          Seven choices.
          <br />
          One machine, made yours.
        </p>
      </div>
    </nav>
  );
}
