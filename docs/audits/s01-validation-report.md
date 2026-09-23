# S01 validation report

Date: 2026-09-23

Branch: `codex/validation-s01`

Case: S01 only

Result: PASS in bundled Chromium. Extracting range `2-3` from a five-page synthetic PDF produced one `extracted-pages.pdf` containing exactly the second and third pages in order.

## Fixture and oracle

The test creates a five-page PDF at runtime with `pdf-lib`. Each page has a distinct selectable marker (`PVP-S01-P01` through `PVP-S01-P05`) and a 420 × 540 pt page size. Before using the app, both `pdf-lib` and PDF.js confirm the source has five pages; PDF.js extracts all five markers in sequence.

The browser opens `/split-pdf/`, checks the Extract pages title, PDF input type, private-beta notice, and `noindex,nofollow`, then selects the PDF and enters `2-3`. Privacy guards are installed before navigation and cover the filename and every marker in request URLs and bodies. A page-lifetime download listener records exactly one `extracted-pages.pdf`. The status reports success, the action button is enabled afterward, and job controls are hidden with the surrounding UI usable.

Independent inspection of the download finds two pages with both `pdf-lib` and PDF.js. PDF.js extracts exactly `PVP-S01-P02` on output page 1 and `PVP-S01-P03` on output page 2, excluding the other three markers. Both parsers report that each output page retains the matching source page's 420 × 540 pt size. The case measures from the run click through the completed download/status and asserts less than 20 seconds; the Playwright case completed in 1.7 seconds. An `S01-oracle-results` attachment records the measured duration, output byte count, status, download list, markers, page counts, and sizes.

## Commands and result

- `npm run build` — PASS; generated 10 tool routes and 5 beta information pages.
- `npx playwright test tests/e2e/validation/split.spec.mjs --project=chromium --grep=S01 --reporter=list` — PASS, 1/1.
- `npm test` — PASS; 77 generated-bundle handler executions.
- `git diff --check` — PASS.

Environment: Node 24, Playwright 1.63.0 (bundled Chromium).

## Coverage limit

This case covers the ordinary contiguous range `2-3` in bundled Chromium. Separate matrix rows cover other range syntax, boundaries, mixed geometry, malformed/encrypted files, and installed Chrome/Edge repetition before release.
