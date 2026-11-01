# KAZAUK PC builder

A Next.js hardware showcase and browser-local PC configurator with 84 products across 29 category slots. This is an independent demonstration, not a store or live quotation service. Demo selections are unrestricted; compatibility is not guaranteed. Prices are researched snapshots. Five products use clearly labelled illustrations; six categories currently have no products.

## Local development

Use Node.js 24 and the committed lockfile:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000/` or `http://localhost:3000/configure`.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
npx playwright test --workers=2
```

## GitHub Pages

Pushing `main` runs `.github/workflows/pages.yml`. It checks source integrity, types, lint and unit tests, creates a static export, and runs desktop/mobile browser tests against that export before deployment. Pages uses the repository's GitHub Actions publishing source.

```sh
node scripts/build-github-pages.mjs
node scripts/serve-github-pages.mjs
# In another terminal:
npx playwright test --config=playwright.pages.config.ts --workers=2
```

The preview is `http://localhost:3001/kazauk-pc-builder/`. `PAGES_BASE_PATH` selects a different project prefix, including an empty prefix for a domain-root deployment. Set `PAGES_TEST_URL` when testing another preview or the live website.

The build uses a temporary checkout and retains the original Next.js config, animation source, dependencies and frames. Exported URLs receive the Pages project prefix; no animation parameters or image bytes are changed. Routes use directory URLs, and the existing WebP product assets are served directly because GitHub Pages has no Next.js image-optimisation server. Original source downloads under `public/models/source` are excluded from the export.

## Design, image provenance and verification

- [Latest design and image audit](docs/image-design-overhaul.md)
- [GitHub publication and validation](docs/github-publication.md)
- [Protected-source hashes](docs/protected-source-hashes.json)

Product photography is not granted a new licence by this repository. Source and use evidence is recorded in the catalogue manifests and image audit.
