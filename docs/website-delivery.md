> The later [design and image overhaul](image-design-overhaul.md) supersedes this record’s layout descriptions and image-coverage counts. Current catalogue size remains 84 products.

> Branding update: the user requested KAZAUK after this delivery. Site wordmarks, page titles and specification exports now use KAZAUK. Genuine IONZ hardware names and manufacturer links remain accurate. Shared header/footer and root metadata changes are text only; the animation files and 156 other protected files remain unchanged. The 159-file audit below records the preceding redesign.

# KAZAUK website delivery — 1 November 2026

## Completed experience

The homepage now has a complete monochrome hardware showroom after the existing cinematic component. The builder uses unrestricted demonstration selection with a clearly visible compatibility disclaimer. The original compatibility engine and source data remain separate and unchanged.

Homepage sections:

1. Post-cinematic showroom navigation and brand introduction.
2. Case-led Build Your PC feature with actual IONZ APEX Vision photography.
3. Component gallery: cases, graphics, processors and motherboards, followed by memory, storage and cooling rows.
4. Why choose individual parts: space/style, usage and upgrade planning.
5. Interactive Hardware Field Notes with seven lessons, terminology, FAQs and keyboard navigation.
6. Featured hardware with actual product information, prices, source dates and category links.
7. Final build call to action and a complete footer with official source links.

All new homepage content is inside `PostCinematicHome`, immediately after the unchanged `CinematicHeroLoader`. The existing `Header`, hero, animation components, frames, global styles, root layout and animation dependencies were not edited.

## Catalogue and category coverage

84 products: 30 original demonstration products and 54 separately researched entries. The latest pass added 13 net products; one duplicate GPU candidate was removed. There are 29 category slots, 23 populated and six awaiting verified products. No illustrative prices were needed. Two manufacturer-reference products have no verified GBP price and explicitly require a quote.

| Category | Products | Products with photographs |
| --- | ---: | ---: |
| PC case | 10 | 10 |
| Processor / CPU | 4 | 2 |
| Motherboard | 6 | 6 |
| Memory / RAM | 4 | 3 |
| Graphics card / GPU | 3 | 3 |
| SSD storage | 9 | 9 |
| HDD storage | 1 | 0 |
| Power supply | 5 | 5 |
| CPU cooler | 4 | 3 |
| Case fans | 3 | 1 |
| Thermal paste | 2 | 2 |
| RGB / ARGB lighting | 0 | 0 |
| Braided PSU cables | 0 | 0 |
| Cooling accessories | 1 | 1 |
| Wi-Fi / Bluetooth adapters | 2 | 2 |
| Sound cards | 0 | 0 |
| Capture cards | 0 | 0 |
| Expansion cards | 0 | 0 |
| External hard drive | 2 | 2 |
| External SSD | 1 | 0 |
| External DVD / Blu-ray drive | 1 | 1 |
| Monitor | 1 | 1 |
| Keyboard | 5 | 5 |
| Mouse | 6 | 6 |
| Headset | 4 | 4 |
| Speakers | 3 | 3 |
| Operating system | 2 | 2 |
| Power cables | 0 | 0 |
| PC accessories | 5 | 5 |

Pending categories: RGB/ARGB lighting, braided PSU cables, sound cards, capture cards, expansion cards and power cables. Each has an explicit catalogue-pending state and does not block the demonstration.

## Photography and pricing

76 products have verified local photographs; 78 images are recorded, including two additional views of the original case. Every recorded image exists and decodes. Images are optimised WebP assets rendered with Next.js Image. Permission for IONZ / PC Gaming Cases imagery was explicitly supplied by the user. Sources and permission notes are in `lib/configurator/product-images.json` and the researched catalogue’s image fields.

Eight labelled photography fallbacks remain:
- AMD Ryzen 9 9900X
- Kingston FURY Beast 32GB (2x16GB) DDR5-5600 CL36 White RGB EXPO
- AMD Wraith Stealth (boxed with Ryzen 5 7600)
- Arctic P12 Slim 12cm Pressure Optimised PWM PST Case Fan w/ Cable Splitter, Black, Fluid Dynamic, 200-2100 RPM
- Arctic P14 14cm Pressure Optimised PWM PST Case Fan w/ Cable Splitter for Continuous Operation, Black, Dual Ball Bearing, 200-1700 RPM
- Intel Core i5-12400F (Box)
- WD Red Plus 6 TB NAS HDD
- Kingston XS1000 1 TB External SSD (Black)

The Ryzen 9900X source image identified a different processor; Intel’s retailer tile was generic; the Arctic downloads were unavailable; the Kingston kit/Wraith images were unresolved; manufacturer photo rights for the WD HDD and Kingston external SSD were not established. No unrelated photographs or generated commercial-SKU photographs were substituted.

Prices and stock messages remain dated source snapshots, not live retail quotes. The running total updates immediately with selections. Quote-required products are excluded from a clearly labelled known subtotal and are never treated as free. The included boxed cooler is legitimately zero-priced in the original catalogue. Delivery and assembly are excluded.

Manufacturer references with quote-required pricing:

- [WD Red Plus 6 TB WD60EFPX](https://www.westerndigital.com/products/internal-drives/wd-red-plus-sata-3-5-hdd?sku=WD60EFPX)
- [Kingston XS1000 SXS1000/1000G](https://www.kingston.com/en/memory/search?partid=SXS1000%2F1000G)

Retailer data anomalies remain explicit: conflicting Mercusys Bluetooth versions and MSI GK30 switch descriptions are labelled as conflicts; implausible Windows requirement units and an unrelated HDD battery field were omitted.

## Working functionality

- Case-first product gallery; compact technical rows for other categories; grouped category navigation on desktop and mobile.
- Search, manufacturer filtering, specification search, maximum-price filter and price/name sorting.
- Product inspection, source notes, image zoom/gallery views and comparison of up to three products.
- Unrestricted selection and replacement across all products, with no socket, memory, clearance, power or stock restriction.
- Price differences, selection highlighting and exact integer-pence totals.
- Eight essential-selection progress indicators, with internal SSD or HDD alternatives and recognised supplied CPU cooling. Optional peripherals do not add essential requirements.
- Itemised build sheet with thumbnails, optional extras, edit/remove and quote-required handling.
- Review at any stage, text specification export, automatic local saving, restore/migration, validated share URLs and confirmed reset.
- Working feedback when storage is blocked or clipboard access is unavailable.
- Contextual education for all 29 categories; keyboard-operable native dialogs, focus return and reduced-motion support in the new interface.
- Homepage category links open the relevant builder category without clearing saved selections.

Demo mode does not claim physical compatibility. `lib/builder/demo.ts` calculates only selection coverage and totals. It does not import or invoke the compatibility engine. Legacy rules and regression scenarios remain testable through the existing engine and adapter.

## Research

The [prior research record](configurator-research.md) documents PCSpecialist, Scan 3XS, CyberPowerPC UK, Overclockers, ORIGIN, Chillblast, Corsair, PCPartPicker and NZXT, with explicit accessibility limits. PCSpecialist, Scan and ORIGIN selection pages were revisited for this pass, along with official IONZ. Useful patterns informed the case-first journey, grouped options, itemised summary, upgrade differences and progressive information. No competitor code, design or assets were copied.

Primary references: [PCSpecialist AM5](https://www.pcspecialist.co.uk/computers/amd-am5-pc/), [Scan 3XS](https://www.scan.co.uk/3xs/configurator/scan-performance-5060-intel/default), [ORIGIN NEURON](https://www.originpc.com/configurator/neuron/), [IONZ](https://ionz.co.uk/). Each added product’s exact source is recorded in the catalogue.

## Validation

Final production checks passed:

- TypeScript: passed.
- ESLint: passed, no warnings.
- Unit and regression checks: 62 passed across four files, including the unchanged twelve-rule / eleven-scenario compatibility suite.
- Production build: passed; `/` and `/configure` statically generated.
- Browser tests: 30 passed across desktop Chrome and mobile. All 84 products were selected/replaced in both layouts, and all 29 categories were visited.
- Responsive checks: 320, 390, 768, 1024 and 1512 px; no observed horizontal overflow. Native product/detail dialogs and comparison layouts were checked down to 320 px.
- All 78 recorded image files decode; homepage photographs were checked after actual browser loading, including the previously lazy-loaded featured section.
- Local production observation: about 280 KB of encoded script resources for the homepage and 277 KB for the builder, including framework/shared code. The new showroom sections recorded zero layout-shift score in that desktop observation. These are local observations, not field-performance guarantees. The protected frame sequence was excluded from optimisation.
- No page errors or failed local image responses were observed in the final new-page audit.
- `git diff --check`: passed. All 159 protected hashes match. The original compatibility tests have no Git diff.

Read-only hero audit: all 90 frames in the existing configured playback range loaded; scrolling between two positions produced different canvas hashes, confirming frame progression. All 121 files on disk remain unchanged. In a fresh headless Chrome session, the initial canvas stayed at its unpainted 300 × 150 backing size until the first scroll, then rendered. This behaviour was observed without modifying the hero; the unchanged source schedules frame drawing through scroll updates. It is reported rather than repaired because the hero is explicitly locked. No claim is made that every browser/profile exhibits the initial-paint issue.

The production preview remains local at `http://localhost:3000/` and `/configure`. Nothing was committed, pushed or deployed.

## Files and implementation

- Homepage route: `app/page.tsx`. Builder route metadata/navigation: `app/configure/page.tsx`.
- New showroom: `components/showroom/PostCinematicHome.tsx`, `HardwareGuide.tsx`, `Showroom.module.css`.
- Builder: `components/builder/Builder.tsx`, `BuilderProducts.tsx`, `BuilderFilters.tsx`, `BuilderNav.tsx`, `BuilderSheet.tsx`, `BuilderDetails.tsx`, `BuilderCompare.tsx`, `BuilderReview.tsx`, `Builder.module.css`.
- State: `hooks/useBuilder.ts`. Demo-only calculations/export: `lib/builder/demo.ts`. Shared model presentation: `lib/builder/presentation.ts`. Category guidance: `lib/builder/help.ts`.
- Catalogue: `lib/builder/researched-products.json`; ten net new product WebPs under `public/products/`. Existing manifests and original data remain available.
- Tests: `tests/configurator/demo.test.ts`, updated builder provenance tests and browser journeys; new `tests/e2e/demo.spec.ts` and `showroom.spec.ts`.
- Research/delivery documentation in `docs/`; the full cumulative working-tree file inventory is [website-file-inventory.txt](website-file-inventory.txt). This includes previously authorised configurator work as well as the latest phase.

No dependencies were added. No backend, payment, authentication, commit, push, deployment or Git-history rewrite was introduced.

## Protected-file audit

A fresh pre-change baseline recorded 159 protected files and their Git state. This includes all 121 frames, cinematic components, frame/canvas helpers, GSAP registration, Lenis provider, shared header/footer/UI, root layout/global CSS, dependency files and original catalogue/compatibility data. Every protected hash is checked against that baseline. The original compatibility scenario test file also has no Git diff.

The preceding baseline had 160 files because it also locked the entire homepage route. This brief explicitly authorises replacing post-cinematic homepage content; `app/page.tsx` was therefore captured separately. Its leading Header/main/CinematicHeroLoader structure remains unchanged, and the new content follows that component. No pre-existing user change was reverted.

## Remaining limits

- Six catalogue categories await reliably sourced products, as listed above.
- Eight individual products use explicit image fallbacks.
- Two manufacturer-reference drives require quotes; all other prices remain source snapshots, not live inventory or pricing feeds.
- The fresh-browser hero initial-paint observation is left untouched under the protection requirement.
- This is a demonstration with no checkout or hardware-compatibility guarantee.
