import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium " +
  "tracking-wide transition-colors duration-200 min-h-11";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-void hover:bg-white",
  ghost: "border border-line text-ink hover:border-graphite hover:bg-raised",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
