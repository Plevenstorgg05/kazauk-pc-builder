import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { IMAGE_REPAIRS, PRODUCTS, productById } from "@/lib/builder/catalogue";
describe("audited product photography", () => {
  it("covers all 84 products with 79 exact-photo products and five explicit illustration cases", () => {
    expect(PRODUCTS).toHaveLength(84);
    expect(PRODUCTS.filter((p) => p.images.length)).toHaveLength(79);
    expect(PRODUCTS.reduce((n, p) => n + p.images.length, 0)).toBe(81);
    expect(
      PRODUCTS.filter((p) => !p.images.length)
        .map((p) => p.id)
        .sort(),
    ).toEqual(
      [
        "cool-wraith-stealth-boxed",
        "research-cpu-bx8071512400f",
        "research-fans-spr-cf120-arcp12pwmpst-slim",
        "research-fans-spr-cf140-arcp14co-pwm",
        "research-hdd-wd60efpx",
      ].sort(),
    );
  });
  it("records a verified or unresolved investigation for every previously missing photograph", () => {
    expect(IMAGE_REPAIRS).toHaveLength(8);
    expect(new Set(IMAGE_REPAIRS.map((r) => r.productId)).size).toBe(8);
    expect(IMAGE_REPAIRS.filter((r) => r.status === "verified")).toHaveLength(
      3,
    );
    for (const repair of IMAGE_REPAIRS) {
      expect(repair.sourcePage).toMatch(/^https:\/\//);
      expect(repair.verification.length).toBeGreaterThan(30);
      expect(repair.permission.length).toBeGreaterThan(30);
      expect(productById(repair.productId)).toBeDefined();
      if (repair.status === "unresolved")
        expect(productById(repair.productId)!.images).toHaveLength(0);
    }
  });
  it("integrates repaired photographs without altering product identity or price", () => {
    const ryzen = productById("cpu-r9-9900x")!;
    expect(ryzen.name).toBe("AMD Ryzen 9 9900X");
    expect(ryzen.price).toBe(460.5);
    expect(ryzen.images[0]!.src).toContain("repair-cpu-r9-9900x");
    const kingston = productById("research-external_ssd-sxs1000-1000g")!;
    expect(kingston.price).toBeNull();
    expect(kingston.images).toHaveLength(1);
    expect(kingston.note).not.toContain("photography withheld");
    for (const p of PRODUCTS)
      for (const image of p.images) {
        expect(existsSync("public" + image.src), image.src).toBe(true);
        expect(image.alt.length).toBeGreaterThan(10);
      }
  });
});
