"use client";
import type { BuilderProduct } from "@/lib/builder/types";
import { HardwareMedia } from "@/components/media/HardwareMedia";
import s from "./Builder.module.css";
export function BuilderPhoto({
  product,
  view = 0,
  large = false,
  eager = false,
  size = "gallery",
}: {
  product: BuilderProduct;
  view?: number;
  large?: boolean;
  eager?: boolean;
  size?: "gallery" | "row" | "thumb";
}) {
  return (
    <div className={`${s.photo} ${large ? s.largePhoto : ""}`}>
      <HardwareMedia
        product={product}
        view={view}
        eager={eager}
        size={large ? "detail" : size}
      />
    </div>
  );
}
