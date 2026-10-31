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
      <main id="main" className="pt-24">
        <Container className="pb-2">
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Your build. Your rules.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-muted">
            Choose your components. Every selection is checked against real published
            specifications — including where those specifications are missing or disagree.
          </p>
        </Container>
        <Configurator />
      </main>
      <Footer />
    </>
  );
}
