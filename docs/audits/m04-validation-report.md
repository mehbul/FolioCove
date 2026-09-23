# M04 validation report

Date: 2026-09-23

Branch: `codex/validation-m04`

Case: M04 only

Result: PASS for the matrix's visible-output and structural-report requirements. Form interactivity is lost and is recorded below.

## Scope and fixtures

This change adds only M04 to `tests/e2e/validation/merge.spec.mjs`. It makes no product-code, dependency, shared-helper, script, CI, or other-case changes. Both synthetic PDFs are generated at runtime in a unique temporary directory and removed after the test. No user document or generated binary is committed.

The first PDF has one text field named `m04.synthetic.value` filled with `PVP-M04-FILLED-VALUE`. Its appearance stream is generated before saving. The second PDF has one visible blue linked region labeled `PVP-M04-LINK-REGION` and a `/Link` annotation with a synthetic `https://example.invalid/pvp-m04-link` URI. The input order is form page, then link page.

Before browser navigation, `pdf-lib` and PDF.js independently open both inputs. The source form must have one registered field, one widget, a filled PDF.js annotation value, and visible dark pixels inside the field. The source link must have one `/Link` annotation with the expected URI, extractable region label, and visible region pixels. These preconditions prevent a broken fixture from producing a misleading pass.

## Browser and output evidence

The existing page/network guard is installed before navigation and watches for uncaught page errors, unapproved external requests, and leakage of the synthetic filenames, markers, or URI in request URLs and bodies. The test checks the merge title, private-beta notice, PDF-only file input, and `noindex,nofollow`. It requires one `merged.pdf` download, a positive status, an enabled run button afterward, and processing within 20 seconds.

Both parsers open the downloaded PDF and report exactly two pages. PDF.js renders both source and output pages at the same dimensions. The interior field region has a dark-pixel ratio of 0.352761 in both source and output; no pixels differ above the fixed per-channel difference threshold of 20. The linked region has a dark-pixel ratio of 0.034841 in both source and output, also with zero changed pixels. The output's second page retains the extractable link label. Thus neither the filled field nor the linked region becomes blank. The test attaches source/output PNG render pairs for both pages and JSON with timing, bytes, pixel statistics, PDF.js annotation values, and `pdf-lib` structural results.

The output is 1,999 bytes. `pdf-lib` finds one `/Widget` with an appearance stream on page 1 and one `/Link` with the exact URI on page 2. PDF.js reports the widget's `PVP-M04-FILLED-VALUE` and the link annotation. The link remains structurally present. The output catalog has no `/AcroForm`, and `pdf-lib` finds zero registered fields, so the remaining widget is orphaned and **the form is no longer interactive**. The test explicitly asserts all of these structural facts. It does not claim that page copying preserved form editing.

## Commands and result

- `npm run build` — PASS; generated 10 tool routes and 5 beta information pages.
- `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --grep M04 --reporter=list` — PASS, 1/1 in bundled Chromium; final test body 891 ms, command 3.6 seconds.
- `npm test` — PASS; syntax, routes, schema, page-range, spreadsheet regressions, and 77 generated-bundle handler executions.

The first sandboxed build and browser attempts could not replace generated `dist` and `test-results` files in the assigned external worktree (`EPERM`). Both required commands passed when rerun with write access to that worktree. The Chromium output showed no page or privacy guard violations.

## Concern

M04's stated oracle accepts a visible filled value and requires an honest interactivity report; both pass. The lost AcroForm and orphaned widget remain a product behavior to evaluate if users expect merged forms to stay editable. This case covers the configured bundled Chromium project, not installed Chrome, Edge, mobile, or other matrix rows.
