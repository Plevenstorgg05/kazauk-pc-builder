import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center">
      <Container>
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">404</p>
        <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-4 max-w-md text-ink-muted">
          That page does not exist. Head back to the showcase or start a build.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/configure" variant="ghost">
            Start building
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
