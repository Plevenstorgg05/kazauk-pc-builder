"use client";
import Image from "next/image";
import { useState } from "react";
import type { BuilderProduct } from "@/lib/builder/types";
import { categoryInfo } from "@/lib/builder/categories";
import { HardwareIllustration } from "./HardwareIllustration";
import s from "./HardwareMedia.module.css";
export type MediaProduct = Pick<
  BuilderProduct,
  "id" | "name" | "category" | "images"
>;
export function HardwareMedia({
  product,
  view = 0,
  size = "gallery",
  eager = false,
}: {
  product: MediaProduct;
  view?: number;
  size?: "gallery" | "row" | "thumb" | "detail" | "feature";
  eager?: boolean;
}) {
  const photo = product.images[view] ?? product.images[0];
  const [loaded, setLoaded] = useState("");
  const [failed, setFailed] = useState("");
  const usable = photo && failed !== photo.src;
  const state = !usable
    ? "illustration"
    : loaded === photo.src
      ? "photo"
      : "loading";
  const sizes =
    size === "thumb"
      ? "64px"
      : size === "row"
        ? "(max-width:679px) 110px, 200px"
        : size === "detail"
          ? "(max-width:679px) 90vw, 600px"
          : size === "feature"
            ? "(max-width:679px) 90vw, 60vw"
            : "(max-width:679px) 90vw, (max-width:1100px) 45vw, 40vw";
  return (
    <div
      className={s.media}
      data-media-state={state}
      data-product-media={product.id}
      data-media-size={size}
    >
      <div className={s.illustration} aria-hidden={Boolean(usable)}>
        <HardwareIllustration category={product.category} />
        <div className={s.caption}>
          <strong>
            {state === "loading" ? "LOADING PHOTOGRAPH" : "ILLUSTRATION"}
          </strong>
          <span>
            {state === "loading"
              ? categoryInfo(product.category).label
              : "Exact product photography unavailable"}
          </span>
        </div>
      </div>
      {usable ? (
        <Image
          className={s.image}
          data-ready={loaded === photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          loading={eager || size === "detail" ? "eager" : "lazy"}
          onLoad={() => setLoaded(photo.src)}
          onError={() => setFailed(photo.src)}
        />
      ) : null}
    </div>
  );
}
