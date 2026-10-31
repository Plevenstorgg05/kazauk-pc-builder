"use client";

import { STOCK_LABELS } from "@/lib/catalog/normalize";
import { formatPounds } from "@/lib/pricing/currency";
import type { AnyPart, Category } from "@/lib/catalog/schema";
import type { RuleResult, Status } from "@/lib/compatibility/types";
import { CompatibilityIndicator } from "./CompatibilityIndicator";

/** Key specs worth surfacing per category, drawn only from the real data. */
function specsFor(category: Category, part: AnyPart): string[] {
  const p = part as Record<string, unknown>;
  const s: string[] = [];
  const push = (v: unknown, fmt: (x: never) => string) => {
    if (v !== null && v !== undefined) s.push(fmt(v as never));
  };
  switch (category) {
    case "cpu":
      push(p.socket, (v: string) => v);
      push(p.cores, (v: number) => `${v} cores`);
      push(p.tdp_w, (v: number) => `${v} W`);
      if (p.cooler_included) s.push("Cooler included");
      break;
    case "motherboard":
      push(p.chipset, (v: string) => v);
      push(p.form_factor, (v: string) => v);
      push(p.memory_type, (v: string) => v);
      break;
    case "memory":
      push(p.capacity_gb, (v: number) => `${v} GB`);
      push(p.speed_mts, (v: number) => `${v} MT/s`);
      push(p.dimm_type, (v: string) => v);
      break;
    case "gpu":
      push(p.chipset, (v: string) => v);
      push(p.length_mm, (v: number) => `${v} mm long`);
      push(p.recommended_psu_w, (v: number) => `${v} W recommended`);
      break;
    case "cooler":
      push(p.type, (v: string) => (v === "aio" ? "Liquid" : "Air"));
      push(p.radiator_mm, (v: number) => `${v} mm radiator`);
      break;
    case "psu":
      push(p.wattage, (v: number) => `${v} W`);
      push(p.form_factor, (v: string) => v);
      break;
    case "case":
      push(p.motherboard_support, (v: string[]) => v.join(" / "));
      push(p.gpu_max_mm, (v: number) => `${v} mm GPU`);
      break;
  }
  return s;
}

export function ProductCard({
  part,
  category,
  selected,
  status,
  reasons,
  onSelect,
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

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        selected ? "border-accent bg-accent/5" : "border-line bg-surface hover:border-graphite"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium leading-snug text-ink">{part.name}</h3>
          <p className="mt-1 font-mono text-[11px] text-ink-faint">
            {STOCK_LABELS[part.stock] ?? part.stock}
          </p>
        </div>
        <p className="shrink-0 font-mono text-sm text-ink">{formatPounds(part.price_gbp)}</p>
      </div>

      {specs.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {specs.map((s) => (
            <li key={s} className="rounded border border-line/80 px-2 py-0.5 text-[11px] text-ink-muted">
              {s}
            </li>
          ))}
        </ul>
      ) : null}

      {status && status !== "compatible" ? (
        <div className="mt-3 space-y-2">
          <CompatibilityIndicator status={status} />
          {reasons.slice(0, 2).map((r) => (
            <p key={r.ruleId} className="text-xs leading-relaxed text-ink-muted">
              {r.message}
            </p>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`min-h-9 rounded-md px-4 text-xs font-medium transition-colors ${
            selected
              ? "bg-accent text-void"
              : blocked
                ? "border border-status-fail/50 text-status-fail hover:bg-status-fail/10"
                : "border border-line text-ink hover:border-graphite hover:bg-raised"
          }`}
        >
          {selected ? "Selected" : blocked ? "Select anyway" : "Select"}
        </button>
        {part.url ? (
          <a
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink-faint underline-offset-2 hover:text-ink-muted hover:underline"
          >
            Source listing
          </a>
        ) : null}
      </div>
    </div>
  );
}
