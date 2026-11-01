"use client";
import {
  CATEGORY_INFO,
  GROUPS,
  categoryInfo,
  type BuilderCategory,
} from "@/lib/builder/categories";
import { productsIn } from "@/lib/builder/catalogue";
import type { BuilderSelection } from "@/lib/builder/types";
import s from "./Builder.module.css";
export function BuilderNav({
  active,
  selection,
  onGoto,
}: {
  active: BuilderCategory;
  selection: BuilderSelection;
  onGoto: (c: BuilderCategory) => void;
}) {
  const groupIndex = categoryInfo(active).group;
  const groups = (
    <div
      className={s.configurationGroups}
      role="group"
      aria-label="Configuration groups"
    >
      {GROUPS.map((g, i) => (
        <button
          key={g.name}
          type="button"
          aria-pressed={groupIndex === i}
          onClick={() => onGoto(CATEGORY_INFO.find((c) => c.group === i)!.id)}
        >
          <span className={s.groupIndex}>{String(i + 1).padStart(2, "0")}</span>
          <span className={s.groupFull}>{g.name}</span>
          <span className={s.groupShort}>{g.short}</span>
          <small>
            {
              CATEGORY_INFO.filter((c) => c.group === i && selection[c.id])
                .length
            }
            /{CATEGORY_INFO.filter((c) => c.group === i).length}
          </small>
        </button>
      ))}
    </div>
  );
  return (
    <nav className={s.navigation} aria-label="Component categories">
      {groups}
      <ol className={s.categoryRail}>
        {CATEGORY_INFO.filter((c) => c.group === groupIndex).map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onGoto(c.id)}
              aria-current={active === c.id ? "step" : undefined}
            >
              <span className={s.navMark} aria-hidden>
                {selection[c.id] ? "✓" : "○"}
              </span>
              <span>{c.label}</span>
              <small>{productsIn(c.id).length || "—"}</small>
            </button>
          </li>
        ))}
      </ol>
      <label className={s.mobileCategorySelect}>
        Choose a component
        <select
          value={active}
          onChange={(e) => onGoto(e.target.value as BuilderCategory)}
        >
          {GROUPS.map((g, i) => (
            <optgroup key={g.name} label={g.name}>
              {CATEGORY_INFO.filter((c) => c.group === i).map((c) => (
                <option key={c.id} value={c.id}>
                  {selection[c.id] ? "✓ " : ""}
                  {c.label}
                  {!productsIn(c.id).length ? " — catalogue pending" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
    </nav>
  );
}
