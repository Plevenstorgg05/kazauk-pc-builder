import { CATEGORIES } from "@/lib/catalog/schema";
import { categoryOf } from "@/lib/catalog/normalize";
import type { Selection } from "@/lib/compatibility/types";
export const STORAGE_KEY = "ionz-build-v1";
/** Untrusted URLs/storage can only select real catalogue IDs in their own category. */
export function validateSelection(value: unknown): Selection {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const result: Selection = {};
  for (const c of CATEGORIES) {
    const id = record[c];
    if (typeof id === "string" && categoryOf(id) === c) result[c] = id;
  }
  return result;
}
export function selectionFromURL(search: string): Selection | null {
  const params = new URLSearchParams(search);
  if (!params.has("build")) return null;
  try {
    return validateSelection(JSON.parse(params.get("build") ?? ""));
  } catch {
    return {};
  }
}
export function buildURL(selection: Selection, href: string): string {
  const url = new URL(href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("build", JSON.stringify(validateSelection(selection)));
  return url.toString();
}
