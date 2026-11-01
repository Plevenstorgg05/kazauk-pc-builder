import { z } from "zod";
import { CATALOG } from "@/lib/catalog/normalize";
import { CaseSchema, type AnyPart, type Category } from "@/lib/catalog/schema";
import {
  specsFor,
  manufacturer,
  displayName,
} from "@/lib/configurator/products";
import media from "@/lib/configurator/product-images.json";
import researched from "./researched-products.json";
import cpuImageRepairs from "./image-repairs-cpu.json";
import storageImageRepairs from "./image-repairs-storage.json";
import { CATEGORY_IDS, type BuilderCategory } from "./categories";
import type { BuilderProduct } from "./types";
const ResearchSchema = z.array(
  z.object({
    id: z.string().min(1),
    category: z.enum(CATEGORY_IDS),
    name: z.string().min(1),
    brand: z.string().min(1),
    model: z.string().nullable(),
    price: z.number().nonnegative().nullable(),
    stock: z.enum(["listed", "sold_out", "unknown", "n/a"]),
    sourceUrl: z.url(),
    captured: z.string(),
    origin: z.literal("researched"),
    specs: z.array(
      z.object({ key: z.string(), label: z.string(), value: z.string() }),
    ),
    images: z.array(
      z.object({
        src: z.string(),
        alt: z.string(),
        sourceUrl: z.url(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    ),
    imagePermission: z.string(),
    note: z.string().optional(),
    caseSpecs: CaseSchema.optional(),
  }),
);
const original: BuilderProduct[] = Object.entries(CATALOG.parts).flatMap(
  ([category, parts]) =>
    parts.map((part) => {
      const p = part as AnyPart;
      const images = media.find((m) => m.productId === p.id);
      const photographs =
        images?.status === "permitted" ? [...images.images] : [];
      if (p.id === "case-ionz-kz-z-v2")
        photographs.sort(
          (a, b) =>
            Number(b.src.endsWith("-3.webp")) -
            Number(a.src.endsWith("-3.webp")),
        );
      const specs = specsFor(category as Category, p);
      if (category === "case")
        specs.unshift({
          key: "colour",
          label: "Colour",
          value: /\(White\)/.test(p.name)
            ? "White"
            : /\(Black\)/.test(p.name)
              ? "Black"
              : "Not stated in demo",
        });
      return {
        id: p.id,
        category: category as Category,
        name: displayName(p),
        brand: manufacturer(p),
        model:
          "mpn" in p ? (p.mpn ?? null) : "sku" in p ? (p.sku ?? null) : null,
        price: p.price_gbp,
        stock: p.stock,
        sourceUrl: p.url ?? null,
        captured: "2026-10-31",
        origin: "original" as const,
        specs,
        images: photographs,
        imagePermission: images?.permission ?? "",
        note: p.demo_note,
        original: p,
      };
    }),
);
const baseProducts: BuilderProduct[] = [
  ...original,
  ...ResearchSchema.parse(researched),
];
const RepairSchema = z.array(
  z
    .object({
      productId: z.string().min(1),
      status: z.enum(["verified", "unresolved"]),
      sourcePage: z.url(),
      images: z.array(
        z.object({
          src: z.string().startsWith("/products/"),
          alt: z.string().min(1),
          sourceUrl: z.url(),
          width: z.number().positive(),
          height: z.number().positive(),
        }),
      ),
      permission: z.string().min(20),
      verification: z.string().min(20),
    })
    .refine(
      (r) =>
        r.status === "verified" ? r.images.length > 0 : r.images.length === 0,
      {
        message:
          "Verified repairs require photographs; unresolved records must remain illustrative.",
      },
    ),
);
export const IMAGE_REPAIRS = RepairSchema.parse([
  ...cpuImageRepairs,
  ...storageImageRepairs,
]);
const repairedIds = new Set<string>();
for (const repair of IMAGE_REPAIRS) {
  if (
    !baseProducts.some((p) => p.id === repair.productId) ||
    repairedIds.has(repair.productId)
  )
    throw new Error(
      "Unknown or duplicate repaired product: " + repair.productId,
    );
  repairedIds.add(repair.productId);
}
export const PRODUCTS: BuilderProduct[] = baseProducts.map((product) => {
  const repair = IMAGE_REPAIRS.find(
    (r) => r.productId === product.id && r.status === "verified",
  );
  return repair
    ? {
        ...product,
        images: repair.images,
        imagePermission: repair.permission,
        imageVerification: repair.verification,
        note: product.note?.replace(
          "Product photography withheld until usage rights are established.",
          "Product photography was verified in the subsequent image audit.",
        ),
        imageSourcePage: repair.sourcePage,
      }
    : product;
});
const ids = new Set<string>();
for (const product of PRODUCTS) {
  if (ids.has(product.id))
    throw new Error("Duplicate builder product: " + product.id);
  ids.add(product.id);
}
export const productById = (id?: string) =>
  id ? PRODUCTS.find((p) => p.id === id) : undefined;
export const productsIn = (category: BuilderCategory) =>
  PRODUCTS.filter((p) => p.category === category);
