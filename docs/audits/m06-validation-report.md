# M06 validation report

Date: 2026-09-23

Branch: `codex/validation-m06`

Case: M06 only

Result: PASS in bundled Chromium. A 50-page marker PDF followed by a one-page PDF produced one 51-page `merged.pdf` in exact input order, finished within 75 seconds, and returned the interface to its idle state.

## Fixture and oracle

The test creates both PDFs at runtime with `pdf-lib`; no user files are used. The first has 50 pages, each 300 x 500 pt and labeled `PVP-M06-P001` through `PVP-M06-P050`. The second has one page labeled `PVP-M06-TAIL`. The test checks the source page counts before upload. It installs the existing page/network privacy guards before navigation, then verifies the merge route, private-beta notice, PDF-only input, and `noindex,nofollow`.

The test requires exactly one download named `merged.pdf`. Both `pdf-lib` and PDF.js read the downloaded file and report 51 pages. PDF.js extracts all 51 markers, and the full ordered list must equal the source marker list. The first, middle, and last markers in the JSON evidence are `PVP-M06-P001`, `PVP-M06-P026`, and `PVP-M06-TAIL`. This checks every intermediate page as well as the required representative positions.

## Timing and idle state

The timer starts immediately before clicking Merge and stops after the download is saved, the success status appears, the run button is enabled, and the job controls are hidden. That full interval must be below 75,000 ms; the download wait has the same bound. The JSON evidence run measured 221 ms. It recorded `Done — your private download is ready.`, `runButtonEnabled: true`, `jobControlsHidden: true`, and one download event. The page/network guards reported zero violations. The output was 11,698 bytes.

## Commands and result

- `npm run build` — PASS; generated 10 tool routes and 5 beta information pages.
- `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --grep=M06 --reporter=list` — PASS, 1/1; 921 ms test body, 3.6 s command.
- Same focused Chromium command with `--reporter=json` — PASS, 1/1; supplied the oracle values above.
- `npm test` — PASS; syntax, routes, schema, page-range and spreadsheet regressions, and 77 generated-bundle handler executions.

## Coverage limit

The 50 pages contain short synthetic text and form a small PDF. This verifies page count and order at 50 pages, but does not establish performance for image-heavy 50-page documents or memory-constrained devices. Those are separate matrix cases. No M06 product defect was observed.
