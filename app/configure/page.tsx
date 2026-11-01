import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Configurator } from "@/components/configurator/Configurator";

export const metadata: Metadata = {
  title: "Build your PC — IONZ",
  description:
    "Choose components, check compatibility against real specifications, and review your build.",
};

/**
 * Server Component shell. Only the Configurator crosses the client boundary;
 * the catalogue is imported into the module graph and validated at build time,
 * so there is no API route for data that is already bundled (brief 13.5).
 */
export default function ConfigurePage() {
  return (
    <>
      <Header />
      <main id="main" className="relative pt-24">
        <div className="ambient-violet relative">
          <Container className="relative z-10 pb-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent-bright">
              Build your own
            </p>
            <h1 className="mt-3 text-balance pb-1 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-tight">
              Your machine. Your rules.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
              Every selection is checked against real published specifications — sockets,
              clearances, power and physical fit. Where a specification is missing or sources
              disagree, we say so rather than guessing.
            </p>
          </Container>
        </div>
        <Configurator />
      </main>
      <Footer />
    </>
  );
}
