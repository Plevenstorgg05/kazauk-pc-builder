import { CATEGORIES } from "@/lib/catalog/schema";
import { findPart } from "@/lib/catalog/normalize";
import type { Selection } from "@/lib/compatibility/types";
/** Progress follows the engine's included-cooler policy without altering selections. */
export function coveredCount(selection: Selection): number {
  const cpu = selection.cpu ? findPart(selection.cpu) : undefined;
  return CATEGORIES.filter(
    (c) =>
      selection[c] ||
      (c === "cooler" &&
        cpu &&
        "cooler_included" in cpu &&
        cpu.cooler_included),
  ).length;
}
