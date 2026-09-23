# M10 validation report

Date: 2026-09-23

Branch: `codex/validation-m10`

Case: M10 only

Result: PASS in bundled Chromium. A PDF exactly one byte over the binary 100 MiB threshold produced the exact private-beta limit error before file reading or processing, with no download. After removing it, a real merge of two small PDFs succeeded.

## Fixture and oracle

The test generates three one-page, marked PDFs with `pdf-lib`. It checks that the future oversized PDF begins with `%PDF-` and is parseable while small, then extends that file to exactly 104,857,601 bytes with `fs.truncate`. It verifies the resulting size with `fs.stat` and checks that the browser's file-selection event sees the same byte count. The source remains a PDF with an original valid page and trailing zero padding; the test deliberately never parses its 100 MiB form.

Privacy guards are installed before navigation and check all three filenames and markers in outbound requests. A page-lifetime download listener records every download. Before app code runs, the test instruments `File.prototype.arrayBuffer` to record file reads and opts into locally stored metrics. The app's merge path obtains bytes through `File.arrayBuffer()` before calling `pdf-lib`; the read log therefore tests whether that path was reached.

With the small PDF and oversized PDF both selected, the merge action is enabled. Clicking it must show exactly `Private beta limit: 100 MB per file. Choose a smaller file.` The test requires zero file reads, zero local metric starts/completions/failures, hidden job controls, responsive file/options/sidebar regions, and no download during the following 1.5 seconds. The selected files remain visible.

The test then removes the oversized file, selects another small PDF, and completes a merge. `pdf-lib` and PDF.js each find two output pages, and PDF.js extracts the two markers in input order. Only the two small filenames appear in the file-read log; one `merged.pdf` download is recorded, and local metrics show one start and one completion. This checks that the blocked attempt did not leave the interface stuck.

## Commands and result

- `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --grep=M10 --reporter=list` — PASS, 1/1.
- `npm run build` — PASS; generated 10 tool routes and 5 beta information pages.
- `npm test` — PASS; 77 generated-bundle handler executions.
- `git diff --check` — PASS.

Environment: Node 24, Playwright 1.63.0 (bundled Chromium).

## Coverage limit

The interface labels its limit as “100 MB,” but the enforcement boundary is `100 * 1024 * 1024` bytes (100 MiB). This case checks one byte above that boundary in Chromium. It does not measure memory use at the limit or test other browsers.
