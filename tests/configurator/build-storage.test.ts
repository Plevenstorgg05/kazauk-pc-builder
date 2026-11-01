import { describe, expect, it } from "vitest";
import {
  buildURL,
  selectionFromURL,
  validateSelection,
} from "@/lib/configurator/build-storage";
import { evaluateBuild } from "@/lib/compatibility/engine";
import { coveredCount } from "@/lib/configurator/progress";
import { CATALOG } from "@/lib/catalog/normalize";
import manifest from "@/lib/configurator/product-images.json";
import { existsSync } from "node:fs";
describe("untrusted saved and shared builds", () => {
  it("rejects unknown IDs, wrong categories and malformed values", () => {
    expect(
      validateSelection({
        cpu: "gpu-msi-5060-ventus-2x-oc",
        psu: "not-real",
        gpu: 42,
        memory: null,
        case: "case-ionz-kz-ze",
      }),
    ).toEqual({ case: "case-ionz-kz-ze" });
    expect(validateSelection(null)).toEqual({});
    expect(validateSelection([])).toEqual({});
  });
  it("distinguishes no shared build from invalid shared data", () => {
    expect(selectionFromURL("")).toBeNull();
    expect(selectionFromURL("?build=%7Binvalid")).toEqual({});
  });
  it("round trips valid selections and discards unrelated URL state", () => {
    const selected = {
      cpu: "cpu-r5-7600",
      motherboard: "mb-tuf-b650-plus-wifi",
    };
    const url = new URL(
      buildURL(selected, "https://example.com/configure?old=1#main"),
    );
    expect(selectionFromURL(url.search)).toEqual(selected);
    expect(url.searchParams.has("old")).toBe(false);
    expect(url.hash).toBe("");
  });
});
describe("included cooling progress", () => {
  it("counts included cooling without requiring a separate selection", () => {
    const s = { cpu: "cpu-r5-7600" };
    expect(coveredCount(s)).toBe(2);
    expect(evaluateBuild(s).missing).not.toContain("cooler");
  });
  it("does not double-count an explicitly selected included cooler", () => {
    expect(
      coveredCount({ cpu: "cpu-r5-7600", cooler: "cool-wraith-stealth-boxed" }),
    ).toBe(2);
    expect(coveredCount({ cpu: "cpu-r7-7800x3d" })).toBe(1);
  });
});
describe("product media integrity", () => {
  it("tracks every real catalogue product exactly once", () => {
    const ids = Object.values(CATALOG.parts)
      .flat()
      .map((p) => p.id)
      .sort();
    expect(manifest.map((p) => p.productId).sort()).toEqual(ids);
  });
  it("only serves permitted, local assets with source provenance", () => {
    for (const entry of manifest)
      for (const image of entry.images) {
        expect(entry.status).toBe("permitted");
        expect(entry.permission).toContain("User confirmed");
        expect(image.sourceUrl).toMatch(/^https:\/\//);
        expect(image.src).toMatch(/^\/products\//);
        expect(existsSync("public" + image.src)).toBe(true);
      }
  });
});
