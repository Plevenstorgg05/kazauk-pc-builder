import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CinematicExperienceLoader } from "@/components/cinematic/CinematicExperienceLoader";
import { SpotlightsAsText } from "@/components/cinematic/CinematicOverlay";

/**
 * Server Component (brief 13.3). Only the cinematic crosses the client
 * boundary; all the surrounding content is static HTML.
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        {/* Scroll-driven disassembly. Currently proxy geometry (Phase 3). */}
        <CinematicExperienceLoader />

        {/* Final transition (brief 4.10) */}
        <section className="border-t border-line/60 py-28">
          <Container>
            <h2 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Your build. Your rules.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-ink-muted">
              Choose your components. Check compatibility. Build with confidence.
            </p>
            <div className="mt-10">
              <ButtonLink href="/configure">Start building</ButtonLink>
            </div>
          </Container>
        </section>

        {/*
          Brief 16: the hardware explanations exist as ordinary HTML too, so the
          3D scene is an enhancement rather than the only route to the content.
        */}
        <section className="border-t border-line/60 py-24">
          <Container>
            <SectionHeading eyebrow="Inside the build" title="What each component does">
              <p>
                The same information presented in the animation above, as plain text.
              </p>
            </SectionHeading>
            <div className="mt-12">
              <SpotlightsAsText />
            </div>
          </Container>
        </section>

        <section className="border-t border-line/60 py-10">
          <Container>
            <p className="max-w-2xl border-l border-line pl-4 font-mono text-xs leading-relaxed text-ink-faint">
              Phase 3 prototype. The hardware shown is temporary proxy geometry sized from real
              ATX dimensions, not a production model. It exists to prove the animation mechanics
              before a licensed 3D asset is dropped into the same rig.
            </p>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
