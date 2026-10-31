"use client";

import { STATUS_COPY } from "@/lib/compatibility/policy";
import type { Status } from "@/lib/compatibility/types";

const TONE = {
  ok: "text-status-ok border-status-ok/40 bg-status-ok/10",
  fail: "text-status-fail border-status-fail/40 bg-status-fail/10",
  caution: "text-status-caution border-status-caution/40 bg-status-caution/10",
} as const;

/**
 * Status is never conveyed by colour alone — every badge carries an icon and a
 * written label, because three of the five states share the same amber tone
 * (brief 11.1, 16).
 */
function Glyph({ icon }: { icon: string }) {
  const common = { width: 12, height: 12, viewBox: "0 0 16 16", "aria-hidden": true } as const;
  switch (icon) {
    case "check":
      return <svg {...common}><path d="M2 8.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "cross":
      return <svg {...common}><path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>;
    case "alert":
      return <svg {...common}><path d="M8 1.5l6.5 12h-13z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="8" cy="11.6" r="0.9" fill="currentColor"/></svg>;
    case "query":
      return <svg {...common}><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M6.2 6.2a1.9 1.9 0 113.1 1.5c-.7.5-1.3.9-1.3 1.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="8" cy="11.6" r="0.85" fill="currentColor"/></svg>;
    default:
      return <svg {...common}><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.6 2.2"/><path d="M8 5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="8" cy="11.4" r="0.85" fill="currentColor"/></svg>;
  }
}

export function CompatibilityIndicator({
  status,
  compact = false,
}: {
  status: Status;
  compact?: boolean;
}) {
  const copy = STATUS_COPY[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${TONE[copy.tone]}`}
    >
      <Glyph icon={copy.icon} />
      {!compact && copy.label}
      {compact && <span className="sr-only">{copy.label}</span>}
    </span>
  );
}
