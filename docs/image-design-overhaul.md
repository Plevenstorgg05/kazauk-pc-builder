# KAZAUK — design and image overhaul

Completed against the approved KAZAUK branding and unrestricted demo behaviour. The homepage hero and animation are outside this work.

## Design audit and changes

The previous rendered pages gave too much space to a third navigation column, repeated bordered product cards and slogan-led section headings. Product photography varied in scale, the missing-photo glyph was generic, and lazy-loading stages could appear empty before image decode.

The revised interface uses:

- A compact two-level category rail, sticky within the configurator, with a native grouped selector and bottom build sheet on tablet/mobile.
- Larger case photography with a curated black/white opening pair; open product layouts with model and price aligned, compact technical rows, restrained separators and explicit selected states.
- Progressive manufacturer/specification/price filters in one compact toolbar.
- A smaller specification ledger with useful empty rows, thumbnails, correct totals and edit/remove actions.
- An aligned desktop comparison table with row headings and difference emphasis; stacked comparisons on mobile. A three-product comparison capacity is explicit; component selection is never restricted.
- Shorter model labels in detail headings, with original catalogue titles and photography verification retained in source notes.
- A redesigned post-cinematic homepage: paired case exhibits, an editorial hardware index beside a graphics spotlight, restrained field notes, planning guidance, a ruled featured-product ledger and a concise final action/footer.
- A shared hardware-media component for gallery, details, comparison, build sheet and homepage images. Category drawings fill image stages while a photo loads or if loading fails. Genuine photographs replace them immediately on decode.

All new styling is scoped to these components. No shared animation dependency, global stylesheet, root layout, header or hero file was changed in this phase.

## Design references

| Reference | Observed principle and applied decision |
| --- | --- |
| [Fractal North](https://www.fractal-design.com/products/cases/north-series/north/north-chalk-white/) | Rendered desktop gallery inspected. Large product framing and restrained labels informed the paired case exhibit. No assets copied. |
| [NZXT H6 Flow](https://nzxt.com/products/h6-flow) | Rendered product page inspected: photography and concise product facts have clear priority. The builder separates image, model/price and specifications accordingly. |
| [Apple Mac](https://www.apple.com/uk/mac/) | Rendered desktop page inspected. Plain product naming, typographic hierarchy and an accessible category index informed the restrained copy and hardware index. The Mac Pro address redirected to the Mac lineup; no current Mac Pro page was claimed. |
| [Corsair PC cases](https://www.corsair.com/uk/en/c/pc-cases) | Structured product/filter page inspected. Category, colour and format filters demonstrate the value of bounded refinements. Our filter panel remains separate from the primary product gallery. |
| [ASUS ROG Hyperion](https://rog.asus.com/cases/rog-hyperion-gr701-model/) | Feature, specification, gallery and support navigation inspected. Details distinguish buying guidance, product facts and provenance. |
| [NVIDIA RTX 50 series](https://www.nvidia.com/en-gb/geforce/graphics-cards/50-series/) | Structured product information inspected. Exact variants and comparison information take precedence over unsupported demo performance claims. |
| [PCSpecialist AM5](https://www.pcspecialist.co.uk/computers/amd-am5-pc/) | Case-first grouped selection inspected. Grouped navigation remains, without adopting its design or imposing compatibility restrictions. |
| [Scan 3XS](https://www.scan.co.uk/3xs/configurator/scan-performance-5060-intel/default) | Summary and upgrade-difference templates inspected. Item prices, differences and build totals remain distinct. Some actual options are JavaScript dependent; no complete purchase flow was claimed. |

Three references were visually inspected in a desktop browser; the others were inspected through accessible structured page content. Our own desktop, tablet and mobile screenshots were reviewed separately. Competitor mobile interactions were not represented as independently audited.

## Product image audit

**Three exact photographs were recovered.** Catalogue coverage is now **79 photographed products out of 84**, with **81 actual image files** including the existing case-gallery views. The remaining **five products have labelled category-specific illustrations**. All 29 category slots remain available; six still have no listed catalogue products, as before.

| Product | Result | Source and use basis |
| --- | --- | --- |
| cpu-r9-9900x | Verified exact photograph integrated | [Investigated primary source](https://pcgamingcases.co.uk/products/pramd-9900x). User confirmed permission for IONZ / PC Gaming Cases product photos on 1 November 2026. |
| ram-fury-beast-32-5600-w | Verified exact photograph integrated | [Investigated primary source](https://pcgamingcases.co.uk/products/sdkin-kf55636bw2). User confirmed permission for IONZ / PC Gaming Cases product photos on 1 November 2026. |
| cool-wraith-stealth-boxed | Labelled category illustration | [Investigated primary source](https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html). No separate Wraith Stealth photograph reused. Manufacturer image permission for this independent demo is not established. |
| research-cpu-bx8071512400f | Labelled category illustration | [Investigated primary source](https://pcgamingcases.co.uk/products/print-i512400f). No photograph reused from sources without established image permission. |
| research-fans-spr-cf120-arcp12pwmpst-slim | Labelled category illustration | [Investigated primary source](https://www.arctic.de/en/P12-Slim-PWM-PST/ACFAN00187A). User permission covers IONZ / PC Gaming Cases photos. No applicable ARCTIC or alternate retailer photo reuse permission was established. |
| research-fans-spr-cf140-arcp14co-pwm | Labelled category illustration | [Investigated primary source](https://www.arctic.de/en/P14-PWM-PST-CO/ACFAN00126A). User permission covers IONZ / PC Gaming Cases photos. No applicable ARCTIC or alternate retailer photo reuse permission was established. |
| research-hdd-wd60efpx | Labelled category illustration | [Investigated primary source](https://www.westerndigital.com/products/internal-drives/wd-red-plus-sata-3-5-hdd?sku=WD60EFPX). User permission covers IONZ / PC Gaming Cases photos. Western Digital terms limit unapproved reuse to personal non-commercial use; no applicable commercial demo permission was established. |
| research-external_ssd-sxs1000-1000g | Verified exact photograph integrated | [Investigated primary source](https://www.kingstonloda.com/asset-management/2NGKT73YG3HL). Official public Kingston LoDA marketing asset: the LoDA FAQ makes public marketing materials available for anyone to find and download. The exact asset offered an unauthenticated Standard download of its original PNG; no restricted asset or account access was used. Kingston describes its marketing assets as materials for promoting its products. |

The recovered photos are: AMD Ryzen 9 9900X from the exact alternative PC Gaming Cases MPN listing, the white Kingston FURY Beast RGB 32 GB kit from its exact retailer SKU, and Kingston XS1000 1 TB packaging from the official public LoDA marketing library. Model/capacity/colour were cross-checked, visually inspected and optimised to local WebP.

The Kingston XS1000 source is a public marketing asset with an unauthenticated original download; [Kingston’s LoDA FAQ](https://lodasupport.kingston.com/faq) describes public marketing access/downloads. The restricted Etail folder was excluded. This is not a claim that all Kingston images are unrestricted or public domain.

Remaining illustrative products: AMD Wraith Stealth, Intel Core i5-12400F, ARCTIC P12 Slim PWM PST, ARCTIC P14 PWM PST CO and WD Red Plus 6 TB WD60EFPX. Exact photos were investigated across official manufacturers and alternative retailers. Confirmed image-use scope did not cover a usable exact photo for these five; no unrelated images or invented hardware photography were substituted.

The original eight missing-photo investigations, exact asset origins, manufacturer identifiers, alternatives checked and rights evidence are recorded in:

- `lib/builder/image-repairs-cpu.json`
- `lib/builder/image-repairs-storage.json`

These are validated overrides on the existing catalogue. Original product data, IDs, manufacturers, prices and compatibility fixtures were not changed. Original manifests remain available; the overrides clearly record corrections.

## Media behaviour

- Exact photographs use Next.js Image, local optimised assets, reserved stage dimensions and responsive sizes.
- A labelled processor, RAM, cooler, fan, storage or other category drawing occupies the stage during loading. It is visibly schematic and never presented as a commercial SKU photograph.
- Failed requests remove the broken image element and leave the labelled drawing. No permanent blank image stage is used.
- Thumbnails, product rows, galleries and details use different scales of the same media component.
- No photographic manipulation of the protected animation frames occurred.

## Validation

Production validation:

- TypeScript, ESLint and production build passed.
- 65 unit/regression checks passed, including the unchanged compatibility fixtures.
- 38 desktop/mobile browser journeys passed against the production server. Coverage includes every product selection/replacement, all 29 categories, actual image rendering for all 84 products, every case-gallery view, zoom, filtering/sorting, comparison/differences/capacity, pricing, review/export, local persistence, cross-context share links, reset and blocked storage/clipboard fallbacks.
- Simulated failed-image and delayed-image responses confirmed that a labelled category drawing replaces a broken image or occupies a loading stage. These injected failures were isolated tests, not broken production assets.
- All 81 local photographic assets decode successfully; 79 products have actual photographs and five have labelled illustrations.
- Production screenshots were inspected at 390, 1024 and 1512 px. Additional overflow checks covered 320, 768, 1199 and 1200 px. No page overflow, console/page errors, hydration errors or failed local responses were observed in the normal final audit.
- A local encoded-script observation measured approximately 283 KB for the homepage and 279 KB for the builder, including framework/shared resources. This is not a field-performance guarantee. No new dependency was added.
- All 160 protected hashes matched the pre-change working-state baseline. The original compatibility scenario test file also has no Git diff.
- `git diff --check` passed.

The final visual review corrected an oversized mobile lesson-tab arrangement, tightened tablet navigation/summary behaviour, checked photo contrast and sizing, and verified aligned desktop comparisons. An image-source note that still said the now-recovered Kingston photo was withheld was corrected in the runtime image override; the underlying original snapshot remains unchanged.

Local production preview: `http://localhost:3000/#showroom` and `http://localhost:3000/configure`. No commit, push or deployment was performed.

## Files changed in this phase

- New shared media: `components/media/HardwareMedia.tsx`, `HardwareIllustration.tsx`, `HardwareMedia.module.css`.
- Homepage after the animation: `components/showroom/PostCinematicHome.tsx`, `HardwareGuide.tsx`, `Showroom.module.css`.
- Configurator: `components/builder/Builder.tsx`, `BuilderNav.tsx`, `BuilderProducts.tsx`, `BuilderFilters.tsx`, `BuilderPhoto.tsx`, `BuilderSheet.tsx`, `BuilderReview.tsx`, `BuilderDetails.tsx`, `BuilderCompare.tsx`, `Builder.module.css`.
- Image integration: `lib/builder/catalogue.ts`, `types.ts`, `image-repairs-cpu.json`, `image-repairs-storage.json`.
- Three new WebP files: `public/products/repair-cpu-r9-9900x.webp`, `repair-ram-fury-beast-32-5600-w.webp`, `repair-external-ssd-kingston-xs1000-1tb.webp`.
- Tests: `tests/configurator/images.test.ts`, the existing catalogue provenance assertions, `tests/e2e/imagery.spec.ts`, and updated navigation/fixture helpers and homepage/filter browser checks. Existing tests were adapted to the new interface, not deleted.
- This delivery report and the cumulative working-tree inventory in `docs/`.

## Protection

Before work, a fresh baseline captured 160 protected files at their current working state, including pre-existing KAZAUK rebranding changes. It includes the homepage route/shell, root layout, shared header/footer/UI, global CSS, all cinematic components and helpers, GSAP registration, Lenis provider, dependencies, all 121 frame assets and the original catalogue/compatibility source data. The final hash audit compares against that baseline, not a reset or an assumed clean Git state.

No commits, pushes, deployments or history changes are part of this work.

## Remaining limits

Five products still use explicitly labelled illustrations for the source/usage reasons recorded above. Six category slots remain unpopulated, and the two previously unpriced manufacturer-reference drives still require quotes. Prices remain historical/researched snapshots. The protected subsystem was preserved byte for byte; no diagnosis, fix or optimisation of the animation was attempted in this phase.
