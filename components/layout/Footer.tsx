import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-line/60 py-10">
      <Container className="flex flex-col gap-2 text-xs text-ink-faint">
        <p>
          Technical demonstration. Not an official IONZ or PC Gaming Cases product, and not a
          live store.
        </p>
        <p>
          Component data and prices are a local snapshot captured on 31 October 2026 and are not
          live prices or live stock.
        </p>
      </Container>
    </footer>
  );
}
