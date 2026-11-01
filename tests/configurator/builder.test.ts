import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { CATALOG, categoryOf } from "@/lib/catalog/normalize";
import { evaluateBuild } from "@/lib/compatibility/engine";
import {
  evaluateBuilder,
  evaluateBuilderCandidate,
} from "@/lib/builder/evaluate";
import { PRODUCTS, productsIn } from "@/lib/builder/catalogue";
import { CATEGORY_IDS } from "@/lib/builder/categories";
import {
  validateBuilder,
  readSharedBuild,
  shareBuild,
} from "@/lib/builder/storage";
import { specificationText } from "@/lib/builder/export";
import type { BuilderSelection, BuilderProduct } from "@/lib/builder/types";
const happy = Object.fromEntries(
  CATALOG.demo_scenarios
    .find((s) => s.name === "Happy path")!
    .pick.map((id) => [categoryOf(id), id]),
) as BuilderSelection;
const ssd = productsIn("ssd")[0]!.id;
describe("expanded builder compatibility", () => {
  for (const scenario of CATALOG.demo_scenarios)
    it(`preserves every original finding: ${scenario.name}`, () => {
      const selection = Object.fromEntries(
        scenario.pick.map((id) => [categoryOf(id), id]),
      );
      const expected = evaluateBuild(selection).results;
      const actual = evaluateBuilder(selection).results;
      for (const finding of expected)
        expect(actual.find((r) => r.ruleId === finding.ruleId)).toEqual(
          finding,
        );
    });
  it("requires internal storage while preserving the old core total", () => {
    const old = evaluateBuilder(happy);
    expect(old.totalPence).toBe(244869);
    expect(old.missing).toEqual(["ssd"]);
    const complete = evaluateBuilder({ ...happy, ssd });
    expect(complete.covered).toBe(8);
    expect(complete.missing).toEqual([]);
    expect(complete.totalPence).toBe(249285);
  });
  it("recognises an included boxed cooler without a separate selection", () => {
    const result = evaluateBuilder({ cpu: "cpu-r5-7600" });
    expect(result.missing).not.toContain("cooler");
    expect(result.covered).toBe(2);
  });
  it("peripherals do not add essential requirements or satisfy internal storage", () => {
    const before = evaluateBuilder(happy);
    const after = evaluateBuilder({
      ...happy,
      mouse: productsIn("mouse")[0]!.id,
      external_hdd: productsIn("external_hdd")[0]!.id,
    });
    expect(after.missing).toEqual(before.missing);
    expect(
      after.results.some(
        (r) =>
          r.ruleId === "peripheral_interfaces" &&
          r.status === "insufficient_data",
      ),
    ).toBe(true);
  });
  it("uses the original fit rules for a researched case", () => {
    const result = evaluateBuilder({
      ...happy,
      case: productsIn("case").find((p) => p.name.includes("M100R"))!.id,
    });
    expect(
      result.results.find((r) => r.ruleId === "board_form_factor")?.status,
    ).toBe("incompatible");
    expect(
      result.results.find((r) => r.ruleId === "radiator_fit")?.status,
    ).toBe("incompatible");
  });
  it("does not present unselected or unresolved products as verified", () => {
    expect(evaluateBuilderCandidate({}, "ssd", ssd).status).toBe(
      "insufficient_data",
    );
    expect(
      evaluateBuilderCandidate({}, "case", productsIn("case")[0]!.id).status,
    ).toBeNull();
  });
  it("supports an HDD alternative and excludes quote-only items from known subtotal", () => {
    const fixture: BuilderProduct = {
      ...productsIn("ssd")[0]!,
      id: "test-hdd",
      category: "hdd",
      price: null,
    };
    PRODUCTS.push(fixture);
    try {
      const result = evaluateBuilder({ ...happy, hdd: fixture.id });
      expect(result.missing).toEqual([]);
      expect(result.totalPence).toBe(244869);
      expect(result.unpriced).toEqual([fixture.id]);
      expect(
        specificationText({ ...happy, hdd: fixture.id }, result),
      ).toContain("Quote required");
    } finally {
      PRODUCTS.pop();
    }
  });
});
describe("catalogue provenance and safe restoration", () => {
  it("has 29 categories and 54 separately researched additions", () => {
    expect(CATEGORY_IDS).toHaveLength(29);
    expect(PRODUCTS.filter((p) => p.origin === "original")).toHaveLength(30);
    expect(PRODUCTS.filter((p) => p.origin === "researched")).toHaveLength(54);
    expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(PRODUCTS.length);
  });
  it("records sources and permission for every usable photo", () => {
    for (const p of PRODUCTS) {
      for (const image of p.images) {
        expect(existsSync("public" + image.src), image.src).toBe(true);
        expect(image.sourceUrl).toMatch(/^https:\/\//);
        expect(p.imagePermission.length).toBeGreaterThan(20);
      }
      if (p.origin === "researched") {
        const host = new URL(p.sourceUrl!).hostname;
        expect([
          "pcgamingcases.co.uk",
          "www.westerndigital.com",
          "www.kingston.com",
        ]).toContain(host);
        if (p.price === null) {
          expect(p.note).toContain("price");
          expect(p.stock).toBe("unknown");
        } else expect(p.price).toBeGreaterThan(0);
        expect(p.captured).toBe("2026-11-01");
      }
    }
  });
  it("rejects unknown keys and wrong-category IDs", () => {
    expect(
      validateBuilder({
        cpu: "cpu-r7-7800x3d",
        motherboard: "cpu-r5-7600",
        gpu: "fake",
        checkout: "yes",
      }),
    ).toEqual({ cpu: "cpu-r7-7800x3d" });
    expect(readSharedBuild("?build=broken")).toEqual({});
    expect(readSharedBuild("")).toBeNull();
  });
  it("round-trips expanded builds through a share URL", () => {
    const build = { ...happy, ssd, mouse: productsIn("mouse")[0]!.id };
    const url = new URL(
      shareBuild(build, "https://example.com/configure?old=1#other"),
    );
    expect(readSharedBuild(url.search)).toEqual(build);
    expect(url.hash).toBe("");
    expect(url.searchParams.has("old")).toBe(false);
  });
});
