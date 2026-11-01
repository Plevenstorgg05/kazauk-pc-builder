import { describe, it, expect } from "vitest";
import { PRODUCTS, productsIn, productById } from "@/lib/builder/catalogue";
import {
  summarizeDemoBuild,
  demoSpecificationText,
  DEMO_NOTICE,
} from "@/lib/builder/demo";
import { evaluateBuild } from "@/lib/compatibility/engine";
import { helpFor } from "@/lib/builder/help";
import { CATEGORY_IDS } from "@/lib/builder/categories";
import type { BuilderSelection } from "@/lib/builder/types";
describe("unrestricted demo model", () => {
  it("keeps real compatibility separate from demonstration selections", () => {
    const mismatched = {
      cpu: "cpu-r7-7800x3d",
      motherboard: "mb-asrock-b450m-hdv-r4",
    };
    const board = productsIn("motherboard").find((p) =>
      p.name.includes("B450M-HDV"),
    )!;
    mismatched.motherboard = board.id;
    expect(
      evaluateBuild(mismatched).results.some(
        (r) => r.ruleId === "socket" && r.status === "incompatible",
      ),
    ).toBe(true);
    const demo = summarizeDemoBuild(mismatched);
    expect(demo.covered).toBe(2);
    expect(demo.totalPence).toBe(
      Math.round((productById(mismatched.cpu)!.price! + board.price!) * 100),
    );
    expect(demo).not.toHaveProperty("blocking");
    expect(demo).not.toHaveProperty("results");
  });
  it("accepts every catalogue product without changing unrelated selections", () => {
    for (const p of PRODUCTS) {
      const other =
        p.category === "case"
          ? { cpu: "cpu-r7-7800x3d" }
          : { case: "case-ionz-kz-z-v2" };
      const selection: BuilderSelection = { ...other, [p.category]: p.id };
      const demo = summarizeDemoBuild(selection);
      expect(demo.unpriced.includes(p.id)).toBe(p.price === null);
      expect(demo.totalPence).toBe(
        Object.values(selection).reduce(
          (sum, id) => sum + Math.round((productById(id)?.price ?? 0) * 100),
          0,
        ),
      );
    }
  });
  it("recognises both original and researched included coolers", () => {
    for (const id of ["cpu-r5-7600", "research-cpu-bx8071512400f"])
      expect(summarizeDemoBuild({ cpu: id }).missing).not.toContain("cooler");
  });
  it("accepts HDD as internal storage while quote-only drives remain unpriced", () => {
    const hdd = productsIn("hdd")[0]!;
    const demo = summarizeDemoBuild({ hdd: hdd.id });
    expect(demo.missing).not.toContain("ssd");
    expect(demo.unpriced).toEqual([hdd.id]);
    expect(demo.totalPence).toBe(0);
    const text = demoSpecificationText({ hdd: hdd.id });
    expect(text).toContain(DEMO_NOTICE);
    expect(text).toContain("Quote required");
    expect(text).toContain("Known subtotal");
    expect(text).not.toContain("COMPATIBILITY FINDINGS");
  });
  it("does not require any optional peripherals", () => {
    const original = summarizeDemoBuild({ cpu: "cpu-r5-7600" });
    const withExtras = summarizeDemoBuild({
      cpu: "cpu-r5-7600",
      external_ssd: productsIn("external_ssd")[0]!.id,
      mouse: productsIn("mouse")[0]!.id,
    });
    expect(withExtras.missing).toEqual(original.missing);
  });
  it("provides useful, category-specific educational information for all categories", () => {
    for (const c of CATEGORY_IDS) {
      const help = helpFor(c);
      expect(help.terms.length, c).toBeGreaterThanOrEqual(3);
      expect(help.faqs.length, c).toBeGreaterThanOrEqual(2);
      expect(JSON.stringify(help)).not.toMatch(
        /rule enforces|demo checks the supplied|engine correctly reports/,
      );
    }
  });
});
