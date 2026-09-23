# S02 validation report

Date: 2026-09-23

Branch: `codex/validation-s02`

Case: S02 only

Result: PASS in bundled Chromium. Selecting `1, 3, 5-6` from a six-page synthetic PDF produced one `extracted-pages.pdf` with exactly four pages carrying markers P01, P03, P05, and P06 in that order.

## Fixture and oracle

The test creates the source at runtime with `pdf-lib`. Each page has a unique selectable marker (`PVP-S02-P01` through `PVP-S02-P06`) and a distinct size: 420 × 540, 430 × 550, 440 × 560, 450 × 570, 460 × 580, and 470 × 590 pt. Before the app runs, both `pdf-lib` and PDF.js confirm all six source pages, markers, and sizes.

Privacy guards are installed before navigation and inspect request URLs and bodies for the filename and all six markers. The browser checks the Extract pages route, PDF input type, private-beta notice, and `noindex,nofollow`. A page-lifetime download listener records exactly one `extracted-pages.pdf`. The status reports success, the action button is enabled afterward, job controls are hidden, and surrounding controls are usable.

Independent inspection confirms four output pages with both parsers. PDF.js text extraction finds exactly P01, P03, P05, P06, excluding P02 and P04. Both `pdf-lib` and PDF.js report the output dimensions as 420 × 540, 440 × 560, 460 × 580, and 470 × 590 pt, matching source indices 1, 3, 5, and 6. The test measures from run click through completed download/status, asserts less than 20 seconds, and attaches `S02-oracle-results` with duration, output byte count, status, download events, source/output markers, page counts, and sizes. The Playwright case completed in 1.7 seconds.

## Commands and result

- `npm run build` — PASS; generated 10 tool routes and 5 beta information pages.
- `npx playwright test tests/e2e/validation/split.spec.mjs --project=chromium --grep=S02 --reporter=list` — PASS, 1/1.
- `npm test` — PASS; 77 generated-bundle handler executions.
- `git diff --check` — PASS.

Environment: Node 24, Playwright 1.63.0 (bundled Chromium).

## Coverage limit

S02 covers a comma-separated selection containing a range in ascending source order. It does not establish behavior for an explicitly reversed selection. Other matrix rows cover malformed expressions and boundary values. Repeating S02 in installed Chrome and Edge remains outstanding before release.
