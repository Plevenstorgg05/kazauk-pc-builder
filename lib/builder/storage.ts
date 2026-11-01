import { CATEGORY_IDS } from "./categories";
import { productById } from "./catalogue";
import type { BuilderSelection } from "./types";
export const BUILDER_STORAGE_KEY = "ionz-builder-v2";
export function validateBuilder(value: unknown): BuilderSelection {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const selected: BuilderSelection = {};
  const input = value as Record<string, unknown>;
  for (const c of CATEGORY_IDS) {
    const id = input[c];
    if (typeof id === "string" && productById(id)?.category === c)
      selected[c] = id;
  }
  return selected;
}
export function readSharedBuild(search: string): BuilderSelection | null {
  const params = new URLSearchParams(search);
  if (!params.has("build")) return null;
  try {
    return validateBuilder(JSON.parse(params.get("build") ?? ""));
  } catch {
    return {};
  }
}
export function shareBuild(selection: BuilderSelection, href: string): string {
  const url = new URL(href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("build", JSON.stringify(validateBuilder(selection)));
  return url.toString();
}
