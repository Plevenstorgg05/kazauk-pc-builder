import { productById } from "./catalogue";
import { validateBuilder } from "./storage";
import { CATEGORY_INFO, type BuilderCategory } from "./categories";
import type { BuilderSelection } from "./types";
import { formatPence, formatPounds } from "@/lib/pricing/currency";
export const DEMO_NOTICE =
  "Demo configurator — component combinations are unrestricted. Hardware compatibility is not guaranteed.";
export interface DemoBuild {
  missing: BuilderCategory[];
  covered: number;
  required: number;
  totalPence: number;
  unpriced: string[];
}
/** Selection coverage and prices only. Hardware compatibility has no influence on demo state. */
export const coolerIncluded = (cpu: ReturnType<typeof productById>) =>
  Boolean(
    cpu?.original &&
      "cooler_included" in cpu.original &&
      cpu.original.cooler_included,
  ) ||
  Boolean(
    cpu?.specs.some(
      (s) => s.key === "cooler_included" && s.value.toLowerCase() === "yes",
    ),
  );
export function summarizeDemoBuild(input: BuilderSelection): DemoBuild {
  const selection = validateBuilder(input);
  const missing: BuilderCategory[] = (
    ["case", "cpu", "motherboard", "memory", "gpu", "psu"] as const
  ).filter((c) => !selection[c]);
  const cpu = productById(selection.cpu);
  const included = coolerIncluded(cpu);
  if (!selection.cooler && !included) missing.push("cooler");
  if (!selection.ssd && !selection.hdd) missing.push("ssd");
  const selected = Object.values(selection).map((id) => productById(id)!);
  return {
    missing,
    covered: 8 - missing.length,
    required: 8,
    totalPence: selected.reduce(
      (sum, p) => sum + (p.price === null ? 0 : Math.round(p.price * 100)),
      0,
    ),
    unpriced: selected.filter((p) => p.price === null).map((p) => p.id),
  };
}
export function demoSpecificationText(input: BuilderSelection): string {
  const selection = validateBuilder(input);
  const summary = summarizeDemoBuild(selection);
  const lines = [
    "KAZAUK — DEMO PC SPECIFICATION",
    DEMO_NOTICE,
    "No order or stock reservation.",
    "",
  ];
  for (const c of CATEGORY_INFO) {
    const p = productById(selection[c.id]);
    if (p)
      lines.push(
        `${c.label}: ${p.name} — ${p.price === null ? "Quote required" : p.price === 0 ? "Included" : formatPounds(p.price)}`,
        `Source: ${p.sourceUrl ?? "Included with processor"} | Snapshot: ${p.captured}`,
      );
  }
  lines.push(
    "",
    `${summary.unpriced.length ? "Known subtotal" : "Component total"}: ${formatPence(summary.totalPence)}`,
  );
  if (summary.unpriced.length)
    lines.push(
      `${summary.unpriced.length} unpriced selections require a quote and are excluded from the subtotal.`,
    );
  lines.push(
    "",
    `Essential selections: ${summary.covered}/${summary.required}`,
    `Not selected: ${summary.missing.map((c) => (c === "ssd" ? "SSD or HDD" : CATEGORY_INFO.find((x) => x.id === c)!.label)).join(", ") || "None"}`,
    "",
    "Prices and availability are source snapshots. Delivery and assembly are excluded.",
    "Verify the complete specification with the component manufacturers before purchasing.",
  );
  return lines.join("\n");
}
