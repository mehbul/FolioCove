# M01 validation report

Date: 2026-09-23

Branch: `codex/validation-m01`

Case: M01 only

Result: PASS

## Scope

This change implements only validation matrix case M01 from `validation-100-plan.md`. It adds one dedicated Playwright test at `tests/e2e/validation/merge.spec.mjs`. No other matrix case, product behavior, shared helper, package script, or CI configuration changed.

## Synthetic fixtures

The test generates both PDFs at runtime with `pdf-lib` in a unique temporary directory and removes the directory after the test. It does not commit fixture binaries or retain a successful output PDF.

| Input | Source page | Marker | Page size (points) |
|---|---:|---|---:|
| `pvp-m01-a.pdf` | 1 | `PVP-M01-A1` | 300 x 500 |
| `pvp-m01-b.pdf` | 1 | `PVP-M01-B1` | 612 x 792 |
| `pvp-m01-b.pdf` | 2 | `PVP-M01-B2` | 640 x 360 |

## Browser workflow and assertions

The test installs the existing page/network privacy guard before navigating to `/merge-pdf/`. The guard fails on uncaught page errors, unapproved external requests, marker or fixture-name leakage in URLs, and marker leakage in request bodies.

Before upload it verifies the `Merge PDFs` title, the beta limitation notice, `accept="application/pdf"`, and `noindex,nofollow`. It uploads the one-page input followed by the two-page input, starts the download watcher before the click, and requires exactly one download named `merged.pdf` plus a successful completion status.

The downloaded bytes are independently opened with `PDFDocument.load()` and PDF.js. Assertions require:

- three pages from each parser;
- extracted page markers exactly mapped as A1, B1, B2, with no other fixture marker on each page;
- monotonically ordered marker offsets in the combined extracted text;
- 300 x 500, 612 x 792, and 640 x 360 point output pages in that order from each parser;
- zero guard violations.

The test attaches `M01-oracle-results` as JSON to the Playwright result. The recorded successful run contained:

- browser project: `chromium`;
- status: `Done — your private download is ready.`;
- output size: 1,323 bytes;
- download events: one, `merged.pdf`;
- PDF.js page text: `PVP-M01-A1`, `PVP-M01-B1`, `PVP-M01-B2`;
- pdf-lib sizes: 300 x 500, 612 x 792, 640 x 360;
- PDF.js sizes: 300 x 500, 612 x 792, 640 x 360.

## Environment

- Windows, PowerShell
- Node.js v24.15.0
- npm 11.12.1
- Playwright 1.63.0
- Playwright project: bundled Chromium using `Desktop Chrome` device settings

## Commands and results

1. `npm run build` — PASS. Generated 10 tool routes and 5 beta information pages.
2. `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --reporter=list` — PASS. 1/1 passed; test body 1.4 seconds; command 6.1 seconds.
3. `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --reporter=json` — PASS. 1/1 passed; test body 757 ms; oracle duration 624 ms; command report duration 3.28 seconds. This run captured the oracle values above.
4. `npm test` — PASS. Syntax, 15 routes, metrics schema, route option initialization, page-range validation, XLSX and legacy XLS spreadsheet-to-PDF regressions, and 77 generated-bundle app-handler executions across 10 generated PDFs plus malformed input.

## Limitations and concerns

This focused implementation proves M01 in the configured Chromium project. Installed Chrome, Edge, WebKit, mobile emulation, and the other 99 validation rows were outside this task. The production build rewrote generated `dist/assets` files due to local line-ending normalization; those generated-only diffs were restored and are not part of the commit.
