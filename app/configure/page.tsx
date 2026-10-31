import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Server Component shell. The configurator UI arrives in a later phase, built
 * on top of the compatibility engine rather than before it.
 */
export default function ConfigurePage() {
  return (
    <>
      <Header />
      <main id="main" className="pt-32 pb-24">
        <Container>
          <SectionHeading eyebrow="Configurator" title="Your build. Your rules.">
            <p>Choose your components. Check compatibility. Build with confidence.</p>
          </SectionHeading>
          <p className="mt-10 max-w-md border-l border-line pl-4 font-mono text-xs leading-relaxed text-ink-faint">
            Route scaffolded in Phase 1. Component selection and the compatibility engine are
            implemented in later phases.
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
