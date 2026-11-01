"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EAGER_FRAMES, FRAME_COUNT, FRAME_FIRST, FRAME_LAST, framePath } from "@/lib/animation/frames";

/**
 * Loads the frame sequence and exposes a draw function.
 *
 * Loading strategy: the first EAGER_FRAMES are fetched before the hero is
 * revealed, so the opening shot is never blank. The remainder streams in behind
 * that with a bounded concurrency, which keeps the browser from opening 90
 * parallel connections and stalling the main document.
 *
 * Decoded images are held in a plain array, not React state — a scroll frame
 * must never trigger a re-render.
 */
export function useFrameSequence() {
  const images = useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: FRAME_COUNT }, () => null),
  );
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;

    const load = (frame: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = framePath(frame);
        const done = () => {
          if (!cancelled) {
            images.current[frame - FRAME_FIRST] = img;
            loaded += 1;
            setProgress(loaded / FRAME_COUNT);
          }
          resolve();
        };
        img.onload = done;
        img.onerror = () => {
          if (!cancelled) setFailed(true);
          resolve();
        };
      });

    (async () => {
      // Opening frames first, so the hero can paint immediately.
      const eager = Array.from({ length: Math.min(EAGER_FRAMES, FRAME_COUNT) }, (_, i) => FRAME_FIRST + i);
      await Promise.all(eager.map(load));
      if (cancelled) return;
      setReady(true);

      // Remainder, four at a time.
      const rest: number[] = [];
      for (let f = FRAME_FIRST + EAGER_FRAMES; f <= FRAME_LAST; f += 1) rest.push(f);
      const CONCURRENCY = 4;
      for (let i = 0; i < rest.length; i += CONCURRENCY) {
        if (cancelled) return;
        await Promise.all(rest.slice(i, i + CONCURRENCY).map(load));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Nearest already-decoded frame at or before the requested one.
   * While the tail is still streaming, this holds the last good frame instead
   * of painting a blank canvas — no flicker, no gaps.
   */
  const resolve = useCallback((frame: number): HTMLImageElement | null => {
    const idx = frame - FRAME_FIRST;
    for (let i = idx; i >= 0; i -= 1) {
      const img = images.current[i];
      if (img) return img;
    }
    for (let i = idx + 1; i < FRAME_COUNT; i += 1) {
      const img = images.current[i];
      if (img) return img;
    }
    return null;
  }, []);

  return { ready, progress, failed, resolve };
}
