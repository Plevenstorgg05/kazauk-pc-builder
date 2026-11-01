import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CinematicHeroLoader } from "@/components/cinematic/CinematicHeroLoader";
import { SpotlightsAsText } from "@/components/cinematic/CinematicOverlay";

/**
 * Server Component. Only the cinematic crosses the client boundary; all the
 * surrounding content is static HTML (brief 13.3).
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <CinematicHeroLoader />

        <section className="border-t border-line/60 py-28">
          <Container>
            <div className="max-w-2xl">
              <h2 className="text-balance pb-1 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                Compatibility, checked properly.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-muted">
                Our configurator checks every selection against real published specifications —
                sockets, clearances, power and physical fit. Where a specification is missing or
                sources disagree, it says so rather than guessing.
              </p>
              <div className="mt-10">
                <ButtonLink href="/configure">Start building</ButtonLink>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t border-line/60 py-24">
          <Container>
            <SectionHeading eyebrow="Inside the build" title="What each component does">
              <p>The hardware in the sequence above, explained.</p>
            </SectionHeading>
            <div className="mt-12">
              <SpotlightsAsText />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
