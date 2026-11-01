/**
 * Scroll-driven frame sequence configuration.
 *
 * Source: public/ionz_frames/, 121 clean (non-watermarked) JPG renders at
 * 832 x 1108. Verified by md5 against ionz_scroll_frames_clean.zip.
 */

export const FRAME_FIRST = 1;

/**
 * The sequence is cut at frame 90, not 121 — a deliberate editorial decision
 * made by inspecting the renders rather than assuming the whole range is good:
 *
 *   frame 1    assembled hero, PC centred and complete
 *   frame 61   dramatic mid-explode, everything still in frame
 *   frame 90   clean fully-exploded composition, PC still fully framed
 *   frame 100  motherboard has left the left edge, PSU the right  <- breaks
 *   frame 121  camera has pushed in, most components out of frame <- unusable
 *
 * Ending on 121 would close the hero on a broken composition. Frames 91-121
 * remain on disk, untouched, if the range is ever revisited.
 */
export const FRAME_LAST = 90;

export const FRAME_COUNT = FRAME_LAST - FRAME_FIRST + 1;

/** Intrinsic render dimensions, used for aspect-correct letterboxing. */
export const FRAME_WIDTH = 832;
export const FRAME_HEIGHT = 1108;
export const FRAME_ASPECT = FRAME_WIDTH / FRAME_HEIGHT;

export function framePath(index: number): string {
  const clamped = Math.min(FRAME_LAST, Math.max(FRAME_FIRST, Math.round(index)));
  return `/ionz_frames/frame_${String(clamped).padStart(4, "0")}.jpg`;
}

/**
 * Map 0..1 scroll progress onto the frame range.
 *
 * Math.min guards the p === 1 edge: without it, progress of exactly 1 maps one
 * past the last frame. This is the classic off-by-one in sequence scrubbers.
 */
export function frameForProgress(p: number): number {
  const clamped = Math.min(1, Math.max(0, p));
  return FRAME_FIRST + Math.min(FRAME_COUNT - 1, Math.floor(clamped * FRAME_COUNT));
}

/** Frames loaded before the experience is considered ready to show. */
export const EAGER_FRAMES = 12;
