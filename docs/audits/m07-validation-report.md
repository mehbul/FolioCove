# M07 validation report

Date: 2026-09-23

Branch: `codex/validation-m07`

Case: M07 only

Result: PASS in bundled Chromium. Merging marked pages around a deliberately blank page produced a three-page PDF in order, with the middle page fully opaque pure white and both surrounding markers preserved.

## Fixture and oracle

All three input PDFs are generated at runtime with `pdf-lib`. The first and last contain unique selectable-text markers; the middle PDF contains one empty 300 × 500 pt page. Page and network privacy guards are installed before navigation. The test verifies the private-beta notice and `noindex,nofollow` metadata.

The test requires exactly one download named `merged.pdf`. Both `pdf-lib` and PDF.js report three pages, and PDF.js text extraction must equal `[PVP-M07-FIRST, empty, PVP-M07-LAST]`. PDF.js renders each page to pixels. The blank page must have no dark pixels, all pixels opaque, and a strict non-white pixel ratio of zero: every RGB channel must be 255 and every alpha channel 255. The surrounding pages must contain visible dark marker pixels.

## Completion and UI recovery

After download, the test waits for success status, an enabled run button, hidden job controls, and `.sidebar`, `#options`, and `#files` to become non-inert. The JSON evidence records page counts, text and pixel measurements, output bytes, one download, and idle state. Privacy guard violations must be zero.

## Commands and result

- `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --grep=M07 --reporter=list` — PASS, 1/1.
- `npm run build` — PASS.
- `npm test` — PASS; 77 generated-bundle handler executions.
- `git diff --check` — PASS.

## Coverage limit

This case verifies an empty synthetic page in a small PDF. It does not represent blank pages with annotations, forms, transparency groups, or unusual page boxes.
