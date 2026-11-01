> Historical record of the preceding configurator phase. The current [website delivery](website-delivery.md) supersedes its product counts and compatibility-interface descriptions; the compatibility engine itself is preserved.

# IONZ configurator redesign — research and implementation record

Research checked 1 November 2026. This document distinguishes observations from design decisions. Retailer pages and extracted content vary with JavaScript, regional settings and availability; inaccessible interactions have not been claimed as tested.

## Configurator research

| Source | Observed selection structure / useful pattern | Applied decision / limits |
| --- | --- | --- |
| [PCSpecialist AM5 configuration](https://www.pcspecialist.co.uk/computers/amd-am5-pc/) | Case selection precedes core hardware, storage, cooling and extras. Categories include supporting explanations. | Case-first ordering; five grouped sections; optional additions remain optional. Extracted selection form inspected. |
| [Scan 3XS configuration](https://www.scan.co.uk/3xs/configurator/scan-performance-5060-intel/default) | Component replacement, upgrade options and a persistent specification/price context. | Keep a live, itemised build sheet and show selection price differences. Template/selection content was readable; no order was submitted. |
| [CyberPowerPC UK AM5 builder](https://www.cyberpowersystem.co.uk/system/amd-7000-series-ryzen-7-custom-pc-builder) | Long grouped configuration, warning/summary templates, save/share/print affordances. | Grouped navigation, portable specifications and contextual conflict explanations. Some actual option content is JavaScript dependent, so template visibility is not treated as a complete interaction audit. |
| [Overclockers UK AM5 configurator](https://www.overclockers.co.uk/ocuk-tech-labs-amd-ryzen-am5-midi-gaming-pc-configurator/SYS-OCT-00044.html) | Actual product configuration exposes case choices and upgrade price changes. | Show the complete item price and the difference from the selected item together. Do not confuse a delta with a product's standalone price. |
| [ORIGIN NEURON](https://www.originpc.com/configurator/neuron/) | Image-led component choices, upgrades and prominent build context. | Large case/GPU photography, model-specific inspection and comparison. Original interface, code and local styling; no competitor assets reused. |
| [Chillblast expert configuration](https://www.chillblast.com/configurators/configure-your-own-chillblast-gaming-pc/configure?expert=true) | Configurator entry/shell reachable; full options not reliably exposed by extracted browsing. | No unsupported claims about its compatibility or mobile interactions. |
| [Corsair PC Builder](https://www.corsair.com/uk/en/pc-builder) | Builder entry page accessible; complete interactive selection unavailable in extraction. | Recorded as a research limitation, not a verified reference for detailed behaviour. |
| [PCPartPicker list](https://uk.pcpartpicker.com/list/) | Access returned 403 in this session. | No invented inspection of its current list, filters or compatibility rules. |
| [NZXT current PC offering](https://nzxt.com/collections/prebuilt-pcs) | Current accessible offering emphasises Player prebuilt configurations/upgrades. | Not described as a verified unrestricted component-by-component BLD flow. |

Common design decisions: keep category navigation separate from product inspection; use large galleries for cases/GPUs/monitors and technical rows for other products; provide concise facts with expanded details; keep source uncertainty visible; allow review of incomplete builds without implying checkout eligibility. Desktop, tablet and mobile were implemented and checked independently in the local browser. Competitor mobile experiences were not all accessible, so our responsive decisions are our own.

## Catalogue and photography

- Original snapshot: 30 products across seven categories, preserved unchanged. It remains identified as a demonstration snapshot, including its original prices and stock labels.
- Expanded snapshot: 41 genuine retailer products, stored separately in `lib/builder/researched-products.json`. Each entry records its source page, captured date, price or nullable price support, availability status, published facts, image origin and permission.
- Total: 71 products. All 29 requested category slots exist; 21 contain products. Eight remain pending: internal HDD, RGB/ARGB lighting, braided PSU cables, sound cards, capture cards, additional expansion cards, external SSD and power cables.
- Candidates whose direct product pages returned 404 were excluded even when search snippets still advertised them. Examples included WD Red Plus WD60EFPX, Kingston XS2000 2 TB, Kingston XS1000 and Seagate drive candidates. No access-control or rate-limit bypass was attempted.
- All researched GBP amounts are source snapshots, not live quotations. Selecting products recalculates the build total immediately; there is no live inventory or price API. Unknown price support uses “Quote required” and a known subtotal, never a fabricated zero price.
- Source templates sometimes simultaneously contain stock messages and notification forms. New products conservatively use “Availability unconfirmed”, or explicitly sold out where clearly stated near the actual product heading. No product is claimed to be currently in stock.
- The user explicitly confirmed permission to use IONZ / PC Gaming Cases product photographs. Source URLs and that confirmation are retained with the images. Original image manifest: `lib/configurator/product-images.json`; expansion manifest: the `images` and `imagePermission` fields in `lib/builder/researched-products.json`.
- 66 products have verified local photography (68 images including the original case gallery). Five use labelled fallbacks: Ryzen 9 9900X, white Kingston RGB 32 GB kit, separately listed Wraith Stealth, Arctic P12 Slim and Arctic P14 CO. A retailer image identifying 9900X3D was withheld for the 9900X. The two Arctic image downloads were unavailable. No unrelated image was substituted.
- Downloaded photos were visually inspected as contact sheets and in the interface, trimmed/resized to WebP and rendered through Next.js Image. The case gallery begins with a case view rather than the original lifestyle image. Manufacturer case photographs may depict demonstration hardware; contextual help explains that photographs do not establish included components.

Source anomalies are not silently promoted into verified constraints. Windows requirement fields with implausible units were omitted; an external HDD battery field was omitted; the Mercusys listing's conflicting Bluetooth versions are explicitly shown as a source conflict. Retailer SKU and manufacturer model are not assumed interchangeable: the UI labels the captured identifier “Model / SKU”. Published case clearance is checked, but radiator position, installed fan occupancy, motherboard headers, lane sharing, BIOS version and QVL details still require verification.

## Compatibility and persistence

`lib/builder/evaluate.ts` adapts the unchanged original engine. All twelve original rules and all eleven regression scenarios remain intact. The original findings are asserted unchanged in the expanded builder. Researched cases use the same fit rules with separately validated case attributes.

Eight essential requirements: case, processor, motherboard, memory, graphics, internal storage, PSU and cooling. Either SSD or HDD satisfies storage. A supplied boxed CPU cooler covers cooling without an additional purchase. Optional peripherals never add essential requirements, and an external drive or empty enclosure never fulfils internal storage.

Additional findings cover firmware support, memory capacity/profile, storage connections, air-cooler height, fan mounts/headers, wireless interfaces, controller/lighting/cable connections, peripheral ports, OS installation and empty enclosures. Missing data remains insufficient data or needs verification. Acknowledgement records understanding, not technical approval, and is cleared by changes.

Builds save locally under `ionz-builder-v2`, with migration from the earlier `ionz-build-v1`. Shared IDs are validated by category; malformed or unknown IDs are discarded. Review, text export and sharing work without accounts or a backend. Reset requires confirmation. This is a local demonstration with no checkout, payment, reservation or deployment.

## Isolation and validation

Implementation is isolated to `/configure`, `components/builder`, `lib/builder`, its hook, local product assets, research documentation and tests. The earlier configurator modules remain available as legacy code and reference data.

The protection check hashes 160 existing protected files, including the homepage hero, all 121 animation frames, canvas/animation code, GSAP/ScrollTrigger/Lenis integration, shared layout/global styles, dependencies and original catalogue/compatibility fixtures. Run:

```sh
python3 scripts/verify-configurator-protection.py /tmp/ionz-protected-baseline.json
npm run typecheck
npm run lint
npm test
npm run build
npx playwright test --workers=2
```

Browser coverage includes case-first entry, homepage navigation, deliberate socket conflict and resolution, storage completion, totals, acknowledgement, review/export/edit, search/specification filtering, comparison, keyboard dismissal/focus return, local restore/reset, shared-build validation, optional categories and overflow at 320, 390, 768, 1024 and 1440 px. Visual screenshots were used to refine gallery imagery, product titles, mobile density and filters.

Final validation on 1 November 2026: production build, TypeScript and ESLint passed; 56 unit/regression checks passed; all 16 desktop/mobile browser journeys passed against the production server. A separate production audit visited all 29 categories at mobile width and found no page errors, failed local responses or horizontal overflow. All 160 protected file hashes matched the baseline. The production preview is served locally at `http://localhost:3000/configure`; nothing was committed, pushed or deployed.
