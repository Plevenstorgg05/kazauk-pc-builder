"use client";

import { STOCK_LABELS } from "@/lib/catalog/normalize";
import { formatPounds } from "@/lib/pricing/currency";
import type { AnyPart, Category } from "@/lib/catalog/schema";
import type { RuleResult, Status } from "@/lib/compatibility/types";
import { CompatibilityIndicator } from "./CompatibilityIndicator";
import { CategoryIcon } from "./CategoryIcon";

/**
 * Specs drawn ONLY from the real dataset. Nothing is inferred or invented,
 * and a missing value simply does not appear.
 */
function specsFor(category: Category, part: AnyPart): { label: string; value: string }[] {
  const p = part as Record<string, unknown>;
  const out: { label: string; value: string }[] = [];
  const add = (label: string, v: unknown, fmt: (x: never) => string) => {
    if (v !== null && v !== undefined) out.push({ label, value: fmt(v as never) });
  };
  switch (category) {
    case "cpu":
      add("Socket", p.socket, (v: string) => v);
      add("Cores", p.cores, (v: number) => `${v}`);
      add("TDP", p.tdp_w, (v: number) => `${v} W`);
      break;
    case "motherboard":
      add("Chipset", p.chipset, (v: string) => v);
      add("Size", p.form_factor, (v: string) => v);
      add("Memory", p.memory_type, (v: string) => v);
      break;
    case "memory":
      add("Capacity", p.capacity_gb, (v: number) => `${v} GB`);
      add("Speed", p.speed_mts, (v: number) => `${v} MT/s`);
      add("Format", p.dimm_type, (v: string) => v);
      break;
    case "gpu":
      add("GPU", p.chipset, (v: string) => v);
      add("Length", p.length_mm, (v: number) => `${v} mm`);
      add("PSU", p.recommended_psu_w, (v: number) => `${v} W`);
      break;
    case "cooler":
      add("Type", p.type, (v: string) => (v === "aio" ? "Liquid" : "Air"));
      add("Radiator", p.radiator_mm, (v: number) => `${v} mm`);
      add("Sockets", p.sockets, (v: string[]) => v.join(", "));
      break;
    case "psu":
      add("Output", p.wattage, (v: number) => `${v} W`);
      add("Format", p.form_factor, (v: string) => v);
      break;
    case "case":
      add("Supports", p.motherboard_support, (v: string[]) => v.join(" / "));
      add("Max GPU", p.gpu_max_mm, (v: number) => `${v} mm`);
      add("Max cooler", p.cooler_max_mm, (v: number) => `${v} mm`);
      break;
  }
  return out;
}

const STOCK_TONE: Record<string, string> = {
  listed: "text-ink-muted",
  sold_out: "text-status-caution",
  unknown: "text-ink-faint",
  "n/a": "text-ink-faint",
};

export function ProductCard({
  part, category, selected, status, reasons, onSelect,
}: {
  part: AnyPart;
  category: Category;
  selected: boolean;
  status: Status | null;
  reasons: RuleResult[];
  onSelect: () => void;
}) {
  const blocked = status === "incompatible";
  const specs = specsFor(category, part);
  const included = part.price_gbp === 0;

  return (
    <article
      className={`surface-card group relative flex flex-col rounded-xl p-5 transition-all duration-200 ${
        selected ? "is-selected" : "hover:-translate-y-0.5"
      }`}
    >
      {selected ? (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-void">
          <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
            <path d="M2.5 8.5l4 4 7-8.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sr-only">Selected</span>
        </span>
      ) : null}

      {/*
        No product photography exists in the dataset, and using unrelated stock
        images would misrepresent specific hardware. A neutral category mark is
        honest and keeps the grid visually even.
      */}
      <div className="mb-4 flex h-20 items-center justify-center rounded-lg border border-line/70 bg-base/60 text-ink-faint transition-colors group-hover:text-accent-bright">
        <CategoryIcon category={category} className="h-8 w-8" />
      </div>

      <h3 className="pr-7 text-sm font-medium leading-snug text-ink">{part.name}</h3>

      <p className={`mt-1.5 font-mono text-[11px] ${STOCK_TONE[part.stock] ?? "text-ink-faint"}`}>
        {STOCK_LABELS[part.stock] ?? part.stock}
      </p>

      {specs.length > 0 ? (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-line/60 pt-3.5">
          {specs.map((s) => (
            <div key={s.label} className="contents">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{s.label}</dt>
              <dd className="truncate text-right text-[11px] text-ink-muted">{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {status && status !== "compatible" ? (
        <div className="mt-4 space-y-2 rounded-lg border border-line/60 bg-base/50 p-3">
          <CompatibilityIndicator status={status} />
          {reasons.slice(0, 1).map((r) => (
            <p key={r.ruleId} className="text-[11px] leading-relaxed text-ink-muted">{r.message}</p>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          <p className="font-mono text-lg leading-none text-ink">
            {included ? "Included" : formatPounds(part.price_gbp)}
          </p>
          {part.url ? (
            <a
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block text-[10px] text-ink-faint underline-offset-2 hover:text-ink-muted hover:underline"
            >
              Source listing
            </a>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`min-h-10 shrink-0 rounded-lg px-4 text-xs font-medium transition-colors ${
            selected
              ? "bg-accent text-void hover:bg-accent-bright"
              : blocked
                ? "border border-status-fail/50 text-status-fail hover:bg-status-fail/10"
                : "border border-line-strong text-ink hover:border-accent/60 hover:bg-accent/10"
          }`}
        >
          {selected ? "Selected" : blocked ? "Select anyway" : "Select"}
        </button>
      </div>
    </article>
  );
}
