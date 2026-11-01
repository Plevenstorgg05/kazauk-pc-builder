# GitHub publication — 1 November 2026

The existing repository is `Plevenstorgg05/kazauk-pc-builder`. Publication targets GitHub Pages at `https://plevenstorgg05.github.io/kazauk-pc-builder/`.

## Pre-publication checks

- TypeScript and ESLint passed.
- 65 unit/regression checks passed.
- 38 existing desktop/mobile browser tests passed against the normal production preview.
- Eight additional desktop/mobile browser tests passed against the exact Pages static export.
- The Pages tests select and replace all 84 products, visit all 29 categories, verify 79 photo products and five labelled illustration products, check responsive overflow, restore saved selections, exercise gallery views/zoom, search/sort/comparison, restore shared builds in a separate context, download the actual specification text and reset saved selections.
- Homepage media checks load all 14 photographs and all 90 currently used sequence frames from the project prefix. Binary checks compare deployed copies of frames 1, 90 and 121 to their originals; the source hash manifest covers all 121 frames.
- Direct configurator URLs, query preservation during slash redirects, Next.js client navigation, the exported 404 page and a deliberately failed image fallback were tested.
- All 160 protected source hashes match the pre-overhaul baseline. Dependencies, shared CSS and the approved animation source remain unchanged.

No new app interaction defect was reproduced in the existing regression suite. Deployment preparation addressed GitHub Pages incompatibilities: the site previously had no static export, project-prefixed public assets or directory-route handling. The isolated build provides these without editing the approved application config or animation source. Test-harness defects discovered while introducing the Pages preview were fixed before publication.

## Added publishing files

- `.github/workflows/pages.yml`: dependency install, validation, static build, Pages browser checks and deployment after successful checks.
- `scripts/build-github-pages.mjs`: temporary static-export build; prefixes public asset references only in emitted files; preserves original source and photo/frame bytes.
- `scripts/serve-github-pages.mjs`: local Pages-shaped preview, directory redirects and 404 handling.
- `playwright.pages.config.ts` and `tests/pages/published.spec.ts`: checks for the exported hosting target.
- `docs/protected-source-hashes.json`: the existing protected-state baseline, now available to CI.
- `README.md`: local and Pages usage.

The static export uses the already optimised local WebP photos without a runtime image server. Saving uses browser storage and sharing uses product IDs in the URL; neither requires a backend. No payment or order flow is present. The five image fallbacks, six unpopulated categories, historical prices and quote-only products documented in the design audit remain intentional demo limitations.

Publishing is explicitly authorised by the user's request to save and publish on GitHub. No new hosting provider or external account is introduced. The workflow follows [GitHub's custom Pages workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and the static-export/base-path guides shipped with the installed Next.js version.
