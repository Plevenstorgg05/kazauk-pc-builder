import type { Metadata } from "next";
import Link from "next/link";
import { Builder } from "@/components/builder/Builder";
import s from "@/components/builder/Builder.module.css";
export const metadata: Metadata = {
  title: "Build your PC | KAZAUK",
  description:
    "Start with your case. Configure core hardware, cooling, storage and peripherals with source-backed product information. Unrestricted demonstration selections; hardware compatibility is not guaranteed.",
};
export default function ConfigurePage() {
  return (
    <div className={s.root}>
      <a className={s.skip} href="#main">
        Skip to PC builder
      </a>
      <header className={s.header}>
        <Link href="/" className={s.brand} aria-label="KAZAUK home">
          KAZAUK
        </Link>
        <span className={s.headerRule} />
        <Link href="/configure" className={s.headerLabel}>
          PC BUILDER
        </Link>
        <nav aria-label="Primary">
          <Link href="/#showroom">
            Explore <span className={s.exploreName}>KAZAUK</span> ↗
          </Link>
          <span>Independent demonstration</span>
        </nav>
      </header>
      <main id="main" className={s.main}>
        <Builder />
      </main>
      <footer className={s.footer}>
        <div>
          <Link href="/" className={s.brand}>
            KAZAUK
          </Link>
          <p>
            Independent technical demonstration.
            <br />
            Not an official KAZAUK product or live store.
          </p>
        </div>
        <p>
          The original 30-product dataset is preserved. Additional products are
          separately researched snapshots.
          <br />
          Prices and availability are not live. No order, payment or stock
          reservation is available.
        </p>
        <Link href="/">Back to the experience ↗</Link>
      </footer>
    </div>
  );
}
