# M03 validation report

Date: 2026-09-23

Branch: `codex/validation-m03`

Case: M03 only

Result: PASS

## Scope

This change implements only validation matrix case M03 from `validation-100-plan.md`. It adds a dedicated M03 Playwright test to `tests/e2e/validation/merge.spec.mjs`. It does not change product code, shared helpers, package dependencies, scripts, CI configuration, M01/M02 behavior, or any later validation case.

## Synthetic fixtures and fixed oracle

Both inputs are generated at runtime in a unique temporary directory and removed after the test. No binary fixture or user document content is committed.

The first input, `pvp-m03-ccitt-scan.pdf`, comes from the existing `createCcittScanPdf()` helper. It is a one-page, image-only PDF containing a 16 x 16 CCITT Group 3 image scaled into a 460 x 560 point page. The second input, `pvp-m03-selectable-text.pdf`, is a one-page `pdf-lib` document containing the unique selectable marker `PVP-M03-SELECTABLE-TEXT`.

Before browser navigation, the independent Node-side oracle opens each fixture with `pdf-lib` and PDF.js. PDF.js renders every page at 1 point per pixel through `@napi-rs/canvas`, then measures pixels whose red, green, or blue channel is below 220. The CCITT fixture must have no extracted text, a fully opaque render, and a dark-pixel ratio from 0.29 through 0.31. The observed source ratio was approximately 0.298137. This is a fixed fixture band rather than a tolerance derived from the merged output.

The text fixture must expose its marker through PDF.js text extraction, render fully opaque, and have a dark-pixel ratio above 0.001. These preconditions make a malformed or accidentally blank fixture fail before the product workflow begins.

## Browser workflow and artifact assertions

The existing privacy/page guard is installed before navigation to `/merge-pdf/`. It records uncaught page errors, unapproved external requests, and leakage of both input filenames or the selectable marker in request URLs and bodies. The download listener is also registered before navigation.

The browser verifies the merge title, private-beta limitation notice, PDF-only input contract, and `noindex,nofollow` metadata. It uploads the scan first and text PDF second, requires the run control to become enabled, starts the download wait before clicking, and enforces the ordinary-case 20-second processing budget. Success requires exactly one download named `merged.pdf`, a positive completion status, and the action returning from processing.

The downloaded bytes are opened independently by `pdf-lib` and PDF.js. Assertions require:

- exactly two pages from both parsers;
- successful PDF.js pixel rendering of both pages at full opacity;
- no extractable text on the scan page;
- the unique selectable marker on the text page and not the scan page;
- a scan-page dark-pixel ratio within the fixed 0.29–0.31 fixture band;
- the merged scan ratio to match the independently rendered source ratio to six decimal places;
- visible text-page pixels with a dark-pixel ratio above 0.001;
- exactly one `merged.pdf` download and zero privacy/page guard violations.

The test attaches source/output PNG render pairs for both pages plus `M03-oracle-results` JSON. The JSON records the case ID, browser project, total and processing durations, completion status, output byte count, download events, fixed band, per-page text, render dimensions, dark-pixel ratios, and opacity ratios.

## Environment

- Windows, PowerShell
- Node.js v24.15.0
- npm 11.12.1
- Playwright 1.63.0
- Playwright project: bundled Chromium with `Desktop Chrome` device settings

## Commands and results

1. `npm run build` — PASS. Generated 10 tool routes and 5 beta information pages.
2. `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --grep M03 --reporter=list` — PASS. 1/1 passed; final test body 889 ms; command 3.5 seconds.
3. `npm test` — PASS. Syntax, 15 routes, metrics schema, route option initialization, page-range validation, XLSX and legacy XLS spreadsheet-to-PDF regressions, and 77 generated-bundle app-handler executions across 10 generated PDFs plus malformed input.

The first sandboxed build and browser attempts could not replace generated files under the external worktree (`EPERM`). Both required commands passed when rerun with permission to write within the user-specified worktree. This was an execution-environment restriction, not an application failure.

## Limitations and concerns

No CCITT decoder failure, blank page, lost selectable text, extra download, or privacy/page guard violation was found, so M03 required no product change. The test uses the platform-specific `@napi-rs/canvas` package already installed as PDF.js's optional Node rendering dependency; a missing optional native package will fail the visual oracle explicitly rather than skip it.

This focused implementation proves M03 in the configured bundled Chromium project. Installed Chrome, Edge, WebKit, mobile emulation, M04–M10, and all non-merge validation rows remain outside this task. The build changed generated `dist/assets` files only through local line-ending normalization; those generated-only changes were restored and are not part of the commit.
