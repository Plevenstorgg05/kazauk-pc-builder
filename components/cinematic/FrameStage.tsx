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
  /* Reused offscreen buffer for edge feathering - allocating one per frame
     would churn memory on every scroll tick. */
  const bufferRef = useRef<HTMLCanvasElement | null>(null);

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
      Overscale reclaims some of the empty studio margin around the machine.
      Kept moderate: components fly close to the frame edges by frame 61, and
      a harder crop would start cutting them off mid-animation.
    */
    const ZOOM = 1.18;
    w *= ZOOM;
    h *= ZOOM;

    const wide = cssW >= 1024;
    const biasX = wide ? targetW * 0.12 : 0;
    const x = (targetW - w) / 2 + biasX;
    const y = (targetH - h) / 2;

    /*
      Paint the render's OWN background across the full canvas first.
      A portrait source can never fill a landscape viewport without cropping
      the machine, so instead of cropping we continue the studio environment
      outwards. Colours are sampled from the actual frames:
        corners   #050311
        mid-edge  #11002c  (the purple glow behind the PC)
        floor     #13111f
      With these matched, the frame's own edges stop being visible and the
      scene reads as one continuous space rather than a picture on a page.
    */
    const floorY = y + h * 0.772; // horizon line measured from the renders

    const backdrop = ctx.createLinearGradient(0, 0, 0, targetH);
    backdrop.addColorStop(0, "#050311");
    backdrop.addColorStop(Math.max(0, Math.min(1, (floorY / targetH) * 0.55)), "#0c0124");
    backdrop.addColorStop(Math.max(0, Math.min(1, floorY / targetH)), "#0f0a1c");
    backdrop.addColorStop(1, "#141220");
    ctx.fillStyle = backdrop;
    ctx.fillRect(0, 0, targetW, targetH);

    // Purple glow, centred on the machine so the spill continues off-frame.
    const glow = ctx.createRadialGradient(
      x + w / 2, y + h * 0.45, 0,
      x + w / 2, y + h * 0.45, Math.max(targetW, targetH) * 0.55,
    );
    glow.addColorStop(0, "rgba(40, 6, 92, 0.85)");
    glow.addColorStop(0.45, "rgba(24, 2, 58, 0.45)");
    glow.addColorStop(1, "rgba(5, 3, 17, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, targetW, targetH);

    /*
      Feather the render's left and right edges into the painted backdrop.
      Even with matched colours a hard boundary is perceptible, and a 6% alpha
      ramp removes it entirely. Done on a reused offscreen buffer with
      destination-out, which erases alpha rather than painting over it - a
      flat overlay colour could not work here because the backdrop is a
      vertical gradient and would mismatch at most heights.
    */
    const bw = Math.max(1, Math.round(w));
    const bh = Math.max(1, Math.round(h));
    let buffer = bufferRef.current;
    if (!buffer) {
      buffer = document.createElement("canvas");
      bufferRef.current = buffer;
    }
    if (buffer.width !== bw || buffer.height !== bh) {
      buffer.width = bw;
      buffer.height = bh;
    }
    const bctx = buffer.getContext("2d");
    if (!bctx) {
      ctx.drawImage(source, x, y, w, h);
      return;
    }
    bctx.clearRect(0, 0, bw, bh);
    bctx.globalCompositeOperation = "source-over";
    bctx.drawImage(source, 0, 0, bw, bh);

    bctx.globalCompositeOperation = "destination-out";
    const feather = Math.round(bw * 0.06);
    const left = bctx.createLinearGradient(0, 0, feather, 0);
    left.addColorStop(0, "rgba(0,0,0,1)");
    left.addColorStop(1, "rgba(0,0,0,0)");
    bctx.fillStyle = left;
    bctx.fillRect(0, 0, feather, bh);

    const right = bctx.createLinearGradient(bw - feather, 0, bw, 0);
    right.addColorStop(0, "rgba(0,0,0,0)");
    right.addColorStop(1, "rgba(0,0,0,1)");
    bctx.fillStyle = right;
    bctx.fillRect(bw - feather, 0, feather, bh);
    bctx.globalCompositeOperation = "source-over";

    ctx.drawImage(buffer, x, y, w, h);
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
