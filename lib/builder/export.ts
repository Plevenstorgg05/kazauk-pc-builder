import { CATEGORY_INFO } from "./categories";
import { productById } from "./catalogue";
import type { BuilderEvaluation, BuilderSelection } from "./types";
import { formatPence, formatPounds } from "@/lib/pricing/currency";
export function specificationText(
  selection: BuilderSelection,
  evaluation: BuilderEvaluation,
): string {
  const lines = [
    "KAZAUK — PC BUILD SPECIFICATION",
    "Independent demonstration. No order or stock reservation.",
    "",
  ];
  for (const c of CATEGORY_INFO) {
    const p = productById(selection[c.id]);
    if (p)
      lines.push(
        c.label +
          ": " +
          p.name +
          " — " +
          (p.price === null
            ? "Quote required"
            : p.price === 0
              ? "Included"
              : formatPounds(p.price)),
        "Source: " +
          (p.sourceUrl ?? "Included with CPU") +
          " | Snapshot: " +
          p.captured,
      );
  }
  lines.push(
    "",
    (evaluation.unpriced.length ? "Known subtotal" : "Component total") +
      ": " +
      formatPence(evaluation.totalPence),
  );
  if (evaluation.unpriced.length)
    lines.push(
      "Some selected items require a quote and are excluded from this subtotal.",
    );
  lines.push("", "COMPATIBILITY FINDINGS");
  for (const r of evaluation.results)
    lines.push(r.status.toUpperCase() + ": " + r.title + " — " + r.message);
  lines.push(
    "",
    "Missing essential selections: " +
      (evaluation.missing
        .map((c) =>
          c === "ssd"
            ? "SSD or HDD"
            : CATEGORY_INFO.find((x) => x.id === c)!.label,
        )
        .join(", ") || "None"),
    "",
    "Prices and availability are snapshots. Delivery and assembly are excluded.",
  );
  return lines.join("\n");
}
