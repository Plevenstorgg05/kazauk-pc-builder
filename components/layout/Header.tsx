import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-void/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-sm font-semibold tracking-[0.25em] text-ink">
          IONZ
        </Link>
        <nav aria-label="Primary">
          {/*
            Brief 16: the configurator must be reachable without sitting through
            the cinematic experience. This link is that guarantee.
          */}
          <Link
            href="/configure"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Build your PC
          </Link>
        </nav>
      </Container>
    </header>
  );
}
