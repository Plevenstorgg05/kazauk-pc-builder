import Link from "next/link";
import { PRODUCTS, productById, productsIn } from "@/lib/builder/catalogue";
import { productName, productPrice } from "@/lib/builder/presentation";
import { helpFor } from "@/lib/builder/help";
import type { BuilderCategory } from "@/lib/builder/categories";
import type { BuilderProduct } from "@/lib/builder/types";
import { HardwareMedia } from "@/components/media/HardwareMedia";
import { HardwareGuide, type HardwareLesson } from "./HardwareGuide";
import s from "./Showroom.module.css";
const ids: Partial<Record<BuilderCategory, string>> = {
  case: "case-ionz-kz-900-v2",
  cpu: "cpu-r7-7800x3d",
  gpu: "gpu-gb-5070ti-gaming-oc",
  motherboard: "mb-tuf-b650-plus-wifi",
  memory: "ram-patriot-venom-32-6000",
  ssd: "research-ssd-ssd-1tbadleg800p",
  cooler: "cool-deepcool-lm360",
};
const pick = (category: BuilderCategory) =>
  productById(ids[category]) ??
  productsIn(category).find((p) => p.images.length)!;
const media = (p: BuilderProduct) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  images: p.images,
});
const categories: [BuilderCategory, string, string][] = [
  ["case", "PC cases", "Form factor, airflow and the enclosure."],
  ["gpu", "Graphics cards", "Rendering, video memory and display outputs."],
  ["cpu", "Processors", "The platform for your games and applications."],
  ["motherboard", "Motherboards", "The connections between every component."],
  ["memory", "Memory", "Working space for the tasks you run."],
  ["ssd", "Internal storage", "System, games and files."],
  ["cooler", "CPU cooling", "Heat transfer, radiator size and mounting."],
];
const learning: [BuilderCategory, string, string][] = [
  ["cpu", "Processor", "Processor"],
  ["gpu", "Graphics card", "Graphics card"],
  ["memory", "Memory", "Memory"],
  ["ssd", "Storage", "Internal storage"],
  ["motherboard", "Motherboard", "Motherboard"],
  ["psu", "Power supply", "Power supply"],
  ["cooler", "Cooling", "CPU cooling"],
];
export function PostCinematicHome() {
  const lessons: HardwareLesson[] = learning.map(([id, label, title]) => {
    const guide = helpFor(id);
    return {
      id,
      label,
      title,
      intro: guide.intro,
      product: media(pick(id)),
      terms: guide.terms.slice(0, 3),
      faq: guide.faqs[0]!,
    };
  });
  const cases = [pick("case"), productById("case-ionz-apex-vision-w")!];
  const graphics = pick("gpu");
  const featured = [
    productById("cpu-r9-9900x")!,
    pick("motherboard"),
    pick("ssd"),
  ];
  return (
    <div className={s.root} id="showroom" data-post-cinematic>
      <nav className={s.sectionNav} aria-label="Explore KAZAUK">
        <Link href="#showroom" className={s.wordmark}>
          KAZAUK<span>HARDWARE & CUSTOM PCS</span>
        </Link>
        <div>
          <Link href="#components">Hardware index</Link>
          <Link href="#learn">Field notes</Link>
          <Link href="/configure" className={s.navBuild}>
            Build your PC <span aria-hidden>↗</span>
          </Link>
        </div>
      </nav>
      <section className={s.introduction} aria-labelledby="showroom-title">
        <div className={s.introEyebrow}>
          <span className={s.eyebrow}>KAZAUK / THE COMPONENT COLLECTION</span>
          <span>{PRODUCTS.length} PRODUCTS · 29 CATEGORIES</span>
        </div>
        <div className={s.introGrid}>
          <h1 id="showroom-title">
            PC hardware.
            <br />
            <span>Your specification.</span>
          </h1>
          <div>
            <p>
              Explore the components. Understand the details. Put together a PC
              specification around the way you want to use it.
            </p>
            <Link href="/configure" className={s.textLink}>
              Open the PC builder <span aria-hidden>↗</span>
            </Link>
            <p className={s.quiet}>
              An independent demonstration for KAZAUK / PC Gaming Cases.
            </p>
          </div>
        </div>
      </section>
      <section className={s.caseFeature} aria-labelledby="build-feature-title">
        <div className={s.caseCopy}>
          <span className={s.eyebrow}>01 / THE ENCLOSURE</span>
          <h2 id="build-feature-title">
            Begin with
            <br /> the case.
          </h2>
          <p>
            Size, layout and finish set the starting point. Choose your
            enclosure, then work through the hardware inside it.
          </p>
          <Link href="/configure" className={s.primary}>
            Start building <span aria-hidden>↗</span>
          </Link>
          <dl>
            <div>
              <dt>Case selection</dt>
              <dd>{productsIn("case").length} models</dd>
            </div>
            <div>
              <dt>Build sheet</dt>
              <dd>Saved as you choose</dd>
            </div>
          </dl>
        </div>
        <div className={s.caseGallery}>
          {cases.map((p) => (
            <Link
              href="/configure?category=case"
              key={p.id}
              className={s.caseExhibit}
              aria-label={`Explore ${p.name}`}
            >
              <span className={s.exhibitIndex}>
                {p.brand} /{" "}
                {p.specs.find((s) => s.label === "Colour")?.value ?? "CASE"}
              </span>
              <div className={s.caseMedia}>
                <HardwareMedia product={media(p)} size="feature" />
              </div>
              <div className={s.exhibitCaption}>
                <strong>{productName(p)}</strong>
                <span>View cases ↗</span>
              </div>
            </Link>
          ))}
          <p>
            Actual case photography. Internal hardware shown in example builds
            is not included by selecting a case.
          </p>
        </div>
      </section>
      <section
        className={s.components}
        id="components"
        aria-labelledby="components-title"
      >
        <div className={s.sectionHeader}>
          <div>
            <span className={s.eyebrow}>02 / HARDWARE INDEX</span>
            <h2 id="components-title">Components, by function.</h2>
          </div>
          <p>
            Open a category in the builder. Your existing selections stay with
            you.
          </p>
        </div>
        <div className={s.indexComposition}>
          <div className={s.hardwareIndex}>
            {categories.map(([id, label, description], i) => (
              <Link href={`/configure?category=${id}`} key={id}>
                <span className={s.indexNumber}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={s.indexMedia}>
                  <HardwareMedia product={media(pick(id))} size="thumb" />
                </div>
                <div>
                  <h3>{label}</h3>
                  <p>{description}</p>
                </div>
                <span className={s.indexCount}>{productsIn(id).length}</span>
                <span className={s.indexArrow} aria-hidden>
                  ↗
                </span>
              </Link>
            ))}
          </div>
          <article className={s.graphicsFeature}>
            <div className={s.spotlightMeta}>
              <span>IN DETAIL / GRAPHICS</span>
              <span>{graphics.brand}</span>
            </div>
            <Link
              href="/configure?category=gpu"
              className={s.graphicsMedia}
              aria-label={`Explore ${graphics.name}`}
            >
              <HardwareMedia product={media(graphics)} size="feature" />
            </Link>
            <div className={s.graphicsCaption}>
              <span className={s.eyebrow}>GIGABYTE / GEFORCE RTX 5070 Ti</span>
              <h3>{productName(graphics)}</h3>
              <Link href="/configure?category=gpu" className={s.textLink}>
                Inspect in the builder <span aria-hidden>↗</span>
              </Link>
            </div>
          </article>
        </div>
      </section>
      <section className={s.learning} id="learn" aria-labelledby="learn-title">
        <div className={s.sectionHeader}>
          <div>
            <span className={s.eyebrow}>03 / HARDWARE FIELD NOTES</span>
            <h2 id="learn-title">Read the specification.</h2>
          </div>
          <p>
            What each component does, which terms matter, and what to check
            before buying.
          </p>
        </div>
        <HardwareGuide lessons={lessons} />
      </section>
      <section className={s.considerations} aria-labelledby="choices-title">
        <div className={s.sectionHeader}>
          <div>
            <span className={s.eyebrow}>04 / PLANNING YOUR BUILD</span>
            <h2 id="choices-title">Before you choose.</h2>
          </div>
          <p>A useful specification starts with your priorities.</p>
        </div>
        <ol>
          {[
            [
              "The space it lives in",
              "Case dimensions, desk space, ventilation and the finish you want to see every day.",
            ],
            [
              "The work it needs to do",
              "Your applications, games and files. Compare the relevant specifications rather than one headline number.",
            ],
            [
              "The parts you may change",
              "Understand the platform, available connections and physical space before planning an upgrade.",
            ],
          ].map(([title, text], i) => (
            <li key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={s.featured} aria-labelledby="featured-title">
        <div className={s.sectionHeader}>
          <div>
            <span className={s.eyebrow}>05 / FROM THE CATALOGUE</span>
            <h2 id="featured-title">Selected hardware.</h2>
          </div>
          <Link href="/configure" className={s.textLink}>
            Browse all components <span aria-hidden>↗</span>
          </Link>
        </div>
        <div className={s.featuredLedger}>
          {featured.map((p, i) => (
            <article key={p.id}>
              <span className={s.ledgerIndex}>0{i + 1}</span>
              <Link
                href={`/configure?category=${p.category}`}
                className={s.ledgerMedia}
                aria-label={`Explore ${p.name}`}
              >
                <HardwareMedia product={media(p)} size="row" />
              </Link>
              <div className={s.ledgerName}>
                <span className={s.eyebrow}>
                  {p.brand} /{" "}
                  {p.origin === "original" ? "DEMO SNAPSHOT" : "RESEARCHED"}
                </span>
                <h3>{productName(p)}</h3>
                <span>Source date {p.captured}</span>
              </div>
              <dl>
                {p.specs
                  .filter((s) => !s.label.toLowerCase().includes("colour"))
                  .slice(0, 2)
                  .map((spec) => (
                    <div key={spec.key}>
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
              </dl>
              <div className={s.ledgerAction}>
                <strong>{productPrice(p)}</strong>
                <Link
                  className={s.textLink}
                  href={`/configure?category=${p.category}`}
                >
                  View product <span aria-hidden>↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className={s.catalogueNote}>
          Product prices and availability are dated source snapshots. Build
          totals update with your selections; this demonstration does not
          provide live quotations.
        </p>
      </section>
      <section className={s.finalCta} aria-labelledby="final-title">
        <div>
          <span className={s.eyebrow}>YOUR BUILD / START AT 01</span>
          <h2 id="final-title">Build a specification.</h2>
          <p>
            Choose, compare and save your hardware. Return to it whenever you’re
            ready.
          </p>
        </div>
        <Link href="/configure" className={s.primary}>
          Build your PC <span aria-hidden>↗</span>
        </Link>
      </section>
      <footer className={s.footer}>
        <div className={s.footerTop}>
          <Link href="#showroom" className={s.footerLogo}>
            KAZAUK
          </Link>
          <p>
            Hardware & custom PC building.
            <br />
            Independent website demonstration.
          </p>
          <nav aria-label="Showroom footer">
            <Link href="#components">Hardware index</Link>
            <Link href="#learn">Field notes</Link>
            <Link href="/configure">PC builder ↗</Link>
          </nav>
          <nav aria-label="Official sources">
            <a href="https://ionz.co.uk/" target="_blank" rel="noreferrer">
              IONZ manufacturer ↗
            </a>
            <a
              href="https://pcgamingcases.co.uk/"
              target="_blank"
              rel="noreferrer"
            >
              PC Gaming Cases ↗
            </a>
          </nav>
        </div>
        <div className={s.footerBottom}>
          <span>KAZAUK / DEMONSTRATION</span>
          <p>
            Not an official website or live store. No orders, payments or stock
            reservations. Demo combinations are unrestricted; hardware
            compatibility is not guaranteed.
          </p>
          <a href="#showroom">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
