"use client";

import { useCallback, useEffect, useRef } from "react";
import { FRAME_ASPECT } from "@/lib/animation/frames";

/**
 * Canvas that renders one frame of the sequence, aspect-correct.
 *
 * Draws with "contain" letterboxing computed by hand rather than CSS
 * object-fit, because the canvas backing store is sized in device pixels for
 * sharpness while layout is in CSS pixels — the two have to be reconciled
 * explicitly or the image distorts on high-DPR screens.
 */
export interface FrameStageHandle {
  draw: (img: HTMLImageElement | null) => void;
}

export function FrameStage({
  onReady,
  className = "",
}: {
  onReady: (handle: FrameStageHandle) => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastImage = useRef<HTMLImageElement | null>(null);

  const draw = useCallback((img: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (img) lastImage.current = img;
    const source = img ?? lastImage.current;
    if (!source) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0 || cssH === 0) return;

    // Cap DPR at 2: beyond that the extra pixels cost fill rate without being
    // visible, and this canvas repaints on every scroll frame.
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const targetW = Math.round(cssW * dpr);
    const targetH = Math.round(cssH * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.clearRect(0, 0, targetW, targetH);

    // Contain: fit entirely inside the box, preserving aspect.
    const boxAspect = targetW / targetH;
    let w: number, h: number;
    if (boxAspect > FRAME_ASPECT) {
      h = targetH;
      w = h * FRAME_ASPECT;
    } else {
      w = targetW;
      h = w / FRAME_ASPECT;
    }

    /*
      The renders carry a margin of empty dark studio around the PC. A small
      overscale reclaims some of it so the machine reads larger, without
      cropping components — parts fly close to the frame edges by frame 61,
      so this stays conservative.
    */
    const ZOOM = 1.1;
    w *= ZOOM;
    h *= ZOOM;

    /*
      On wide viewports the copy occupies the left third, so the PC is biased
      right to sit clear of it. Narrow viewports stay centred, where the copy
      sits below instead.
    */
    const wide = cssW >= 1024;
    const biasX = wide ? targetW * 0.14 : 0;

    ctx.drawImage(source, (targetW - w) / 2 + biasX, (targetH - h) / 2, w, h);
  }, []);

  useEffect(() => {
    onReady({ draw });
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Redraw on resize so the letterbox maths stays correct.
    const ro = new ResizeObserver(() => draw(null));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw, onReady]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Gaming PC disassembling as you scroll"
    />
  );
}
