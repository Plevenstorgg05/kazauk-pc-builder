import type { Category } from "@/lib/catalog/schema";

/**
 * Line icons, one per category. Drawn as inline SVG rather than an icon
 * dependency: seven glyphs do not justify a package, and these can share the
 * exact stroke weight of the rest of the interface.
 */
export function CategoryIcon({ category, className = "" }: { category: Category; className?: string }) {
  const p = {
    width: 18, height: 18, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, className, "aria-hidden": true,
  };
  switch (category) {
    case "cpu":
      return <svg {...p}><rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="10" y="10" width="4" height="4" rx="0.5"/><path d="M9 4v3M12 4v3M15 4v3M9 17v3M12 17v3M15 17v3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3"/></svg>;
    case "motherboard":
      return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="6.5" y="6.5" width="5" height="5" rx="0.6"/><path d="M14.5 7h3M14.5 10h3M6.5 15h11M6.5 18h7"/></svg>;
    case "memory":
      return <svg {...p}><path d="M3 7h18v8H3z"/><path d="M6 15v2M10 15v2M14 15v2M18 15v2M7 10h2M11 10h2M15 10h2"/></svg>;
    case "gpu":
      return <svg {...p}><rect x="2.5" y="7" width="19" height="10" rx="1.5"/><circle cx="8" cy="12" r="2.4"/><circle cx="15" cy="12" r="2.4"/><path d="M2.5 17v3"/></svg>;
    case "case":
      return <svg {...p}><rect x="5" y="2.5" width="14" height="19" rx="1.8"/><path d="M9 6h6M9 9h6"/><circle cx="12" cy="15" r="2.6"/></svg>;
    case "cooler":
      return <svg {...p}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4c2.2 2.4 2.2 4.4 0 6M20 12c-2.4 2.2-4.4 2.2-6 0M12 20c-2.2-2.4-2.2-4.4 0-6M4 12c2.4-2.2 4.4-2.2 6 0"/></svg>;
    case "psu":
      return <svg {...p}><rect x="2.5" y="6" width="19" height="12" rx="1.8"/><circle cx="8.5" cy="12" r="3"/><path d="M15 10h4M15 13.5h4"/></svg>;
  }
}
