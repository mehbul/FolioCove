# PrivyPDF

PrivyPDF is a private beta PDF utility that runs document processing in the browser. The existing Sites host serves static files from `dist/`; editable source lives in `src/` and is built reproducibly with npm.

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

Run the generated-bundle and static route checks:

```powershell
npm test
```

This suite parses generated JavaScript, verifies all expected routes, checks generated files for blocked third-party JavaScript CDN/upload markers, and exercises 77 generated-bundle PDF handler cases against synthetic PDFs and malformed input. It also covers generated-bundle XLSX and legacy XLS spreadsheet-to-PDF regressions.

Run the browser E2E suite against Playwright-managed Chromium:

```powershell
npm run test:e2e
```

The E2E suite serves the built `dist/` app, opens the ten dedicated routes directly, checks the selected tool and controls, verifies `noindex,nofollow`, watches for uncaught page errors, monitors processing requests for document-marker leakage and non-local POST/PUT/PATCH traffic, and validates downloaded artifacts from synthetic fixtures. It covers merge, split, visual organizer, target compression, camera/photo-to-PDF, edit, typed sign, redact, Privacy Inspector, unsupported file type, and malformed PDF flows.

Run the same deterministic suite against installed desktop Chrome and Edge on Windows when available:

```powershell
npm run test:e2e:installed
```

Run the network-dependent OCR check explicitly when English Tesseract traineddata access is available:

```powershell
npm run test:e2e:ocr
```

The regular E2E script skips this OCR test to keep CI deterministic and reasonably fast. CI installs Playwright Chromium and runs `npm ci`, `npm run build`, `npm test`, and `npm run test:e2e`.

Playwright traces and screenshots are retained only on failure under ignored `test-results/` and `playwright-report/` paths.

## Project Structure

- `src/pages/home.html` is the editable homepage shell.
- `src/app/index.mjs` contains the browser tool handlers.
- `src/app/launch.mjs` contains core route metadata, notices, and launch-time instrumentation.
- `src/content/routes.mjs` contains the 10 core route list and 5 documentation pages used by the build.
- `src/styles/launch.css` contains shared launch and policy-page styles.
- `src/static/` contains static generated-site assets.
- `scripts/build.mjs` regenerates `dist/`.
- `scripts/dev-server.mjs` serves the generated site locally.
- `scripts/test-launch.mjs` runs static and generated-bundle handler verification.
- `tests/e2e/` contains Playwright browser tests and deterministic fixture generation helpers.
- `playwright.config.mjs` defines Chromium, Chrome, and Edge browser projects.
- `.openai/hosting.json` still points hosting at `dist/`.

## Privacy Model

Documents are selected by the browser and processed on the user's device. The app does not add accounts, payments, remote analytics, uploads, or document-upload endpoints. Optional beta metrics remain local browser storage only and omit filenames, contents, hashes, raw errors, and identifiers.

Build-time browser dependencies are bundled into local site assets so normal PDF processing does not fetch executable JavaScript from third-party CDNs. OCR language models may still load from the Tesseract model host, and browser-managed translation models may be downloaded or used by the browser Translator API. The site host still receives normal requests for app assets and authenticated access.

## Limitations

This private beta is not ready for public launch. The automated browser suite verifies that selected synthetic workflows complete and produce parseable downloads; it does not prove visual fidelity, OCR accuracy, compression quality, redaction security, full sanitization, camera hardware behavior, mobile behavior, Safari compatibility, or human task completion. Keep originals and independently inspect every output.
