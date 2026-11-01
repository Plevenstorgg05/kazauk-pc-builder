"use client";
import Image from "next/image";
import { useState } from "react";
import type { AnyPart, Category } from "@/lib/catalog/schema";
import rawManifest from "@/lib/configurator/product-images.json";
interface MediaEntry {
  productId: string;
  status: string;
  images: {
    src: string;
    alt: string;
    sourceUrl: string;
  }[];
}
const manifest = rawManifest as MediaEntry[];
import { CategoryIcon } from "./CategoryIcon";
import s from "./Workspace.module.css";
export function ProductMedia({
  part,
  category,
  large = false,
  index = 0,
}: {
  part: AnyPart;
  category: Category;
  large?: boolean;
  index?: number;
}) {
  const [broken, setBroken] = useState(false);
  const entry = manifest.find((p) => p.productId === part.id);
  const item =
    entry?.status === "permitted"
      ? (entry.images[index] ?? entry.images[0])
      : undefined;
  if (item && !broken)
    return (
      <div className={`${s.media} ${large ? s.mediaLarge : ""}`}>
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes={
            large
              ? "(max-width: 720px) 90vw, 540px"
              : "(max-width: 720px) 120px, 180px"
          }
          onError={() => setBroken(true)}
          style={{ objectFit: "contain" }}
        />
      </div>
    );
  return (
    <div
      className={`${s.media} ${s.mediaFallback} ${large ? s.mediaLarge : ""}`}
    >
      <CategoryIcon category={category} />
      <span>
        {part.price_gbp === 0 ? "Included cooling" : "Product image pending"}
      </span>
    </div>
  );
}
export function imageCount(id: string) {
  const e = manifest.find((p) => p.productId === id);
  return e?.status === "permitted" ? e.images.length : 0;
}
