# PrivyPDF

PrivyPDF is a private beta PDF utility that runs document processing in the browser. The existing Sites host serves static files from `dist/`; editable source now lives in `src/` and is built reproducibly with npm.

## Windows Setup

Install Node.js 24 and npm 10 or newer, then install dependencies from the lockfile:

```powershell
npm ci
```

Do not commit `node_modules/`. Direct runtime and development dependencies are pinned exactly in `package.json`.

## Local Development

Build the generated site, then serve it locally:

```powershell
npm run build
npm run dev
```

The dev server serves `dist/` at `http://localhost:4173/`. Re-run `npm run build` after source changes.

## Build

```powershell
npm run build
```

The build regenerates `dist/`, including the homepage, the 10 core tool routes, the 5 beta/legal documentation routes, local browser dependency bundles, the service worker, manifest, and tester CSV template.

## Testing

```powershell
npm test
```

The test suite parses the generated JavaScript, verifies all expected routes, checks that generated files do not reference third-party JavaScript CDNs or document-upload endpoints, and exercises 77 PDF handler cases against synthetic PDFs and malformed input.

## Project Structure

- `src/pages/home.html` is the editable homepage shell.
- `src/app/index.mjs` contains the browser tool handlers.
- `src/app/launch.mjs` contains core route metadata, notices, and launch-time instrumentation.
- `src/content/routes.mjs` contains the 10 core route list and 5 documentation pages used by the build.
- `src/styles/launch.css` contains shared launch and policy-page styles.
- `src/static/` contains static generated-site assets.
- `scripts/build.mjs` regenerates `dist/`.
- `scripts/dev-server.mjs` serves the generated site locally.
- `scripts/test-launch.mjs` runs static and handler verification.
- `.openai/hosting.json` still points hosting at `dist/`.

## Privacy Model

Documents are selected by the browser and processed on the user's device. The app does not add accounts, payments, remote analytics, uploads, or document-upload endpoints. Optional beta metrics remain local browser storage only and omit filenames, contents, hashes, raw errors, and identifiers.

Build-time browser dependencies are bundled into local site assets so normal PDF processing does not fetch executable JavaScript from third-party CDNs. OCR language models may still load from the Tesseract model host, and browser-managed translation models may be downloaded or used by the browser Translator API. The site host still receives normal requests for app assets and authenticated access.

## Limitations

This private beta is not ready for public launch. Redaction, sanitization, OCR, compression, conversions, and quality checks require independent output review. Browser compatibility, mobile behavior, network inspection, and human tester completion remain separate launch gates.
