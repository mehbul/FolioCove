# Private beta validation

## Generated-bundle verification

Command: `npm test`

Passed:
- Main script, launch module and service worker parse successfully.
- Ten dedicated tool routes and five documentation routes exist.
- Tool-specific controls initialize for direct selection.
- Metrics expose only tool ID, outcome and duration.
- Page-range validation accepts valid ranges and rejects invalid ones.
- 77 generated-bundle application-handler executions cover merge, extract, add text, typed signature, rotation, numbering and reversal across ten generated PDFs, plus malformed-input rejection for each handler.
- Generated output PDFs reopen and have the expected page counts.
- Spreadsheet-to-PDF generated-bundle regressions cover both XLSX and legacy OLE/BIFF XLS fixtures.

## Browser E2E verification

Command: `npm run test:e2e`

Passed in Playwright-managed Chromium:
- All ten dedicated routes load directly: Merge PDFs, Extract pages, Visual page organizer, Compress to target size, Camera document scanner, Searchable OCR PDF, Edit PDF, Sign PDF, Secure redact, and Privacy Inspector.
- Each route selects the expected tool, exposes expected controls, preserves `noindex,nofollow`, and produces no uncaught page errors.
- Synthetic happy-path downloads are verified by opening/parsing the resulting artifacts:
  - Merge: two synthetic PDFs become a three-page PDF.
  - Split: pages 2-3 are extracted and expected marker text remains present.
  - Visual organizer: page order changes and the downloaded PDF remains parseable.
  - Target compression: downloaded PDF remains parseable with expected page count.
  - Camera scanner/photo-to-PDF: a generated PNG document photo becomes a one-page PDF.
  - Edit PDF: added text is extractable from the downloaded PDF.
  - Typed sign: typed signature text is extractable from the downloaded PDF.
  - Redact: rasterized redaction output opens and the synthetic target text is not extractable.
  - Privacy Inspector: metadata is reported and the sanitized copy opens with title/author cleared.
- Unsupported TXT input for a PDF workflow produces a clear error and no download.
- Malformed PDF input produces an error and no misleading download.
- During processing, the network guard fails on non-local POST/PUT/PATCH requests and on request URL/body leakage of the synthetic filename or unique document marker. No violations were observed in the passing runs.

Command: `npm run test:e2e:installed`

Passed on installed Windows desktop browsers:
- Google Chrome: 19 deterministic E2E tests passed; OCR model-dependent test skipped.
- Microsoft Edge: 19 deterministic E2E tests passed; OCR model-dependent test skipped.

Command: `npm run test:e2e:ocr`

Passed in Playwright-managed Chromium:
- Searchable OCR accepted a synthetic PDF, fetched any required English model data only through the documented Tesseract model host allowance, downloaded `searchable-ocr.pdf`, and the output opened as a one-page PDF.

## Defects found and fixed

- Visual organizer thumbnails could render while the Apply button stayed disabled because PDF.js cleanup ran before restoring the user-visible action state. The handler now re-enables the action as soon as organizer state is valid, then performs PDF.js cleanup best-effort.

## Pending / NOT verified

- Safari, mobile browsers, Android Chrome, iOS Safari, and camera hardware capture.
- Visual fidelity of compression, scanner enhancement, edit placement, signature placement, redaction appearance, and organized-page thumbnails.
- OCR accuracy beyond the parseable-output smoke test.
- Compression quality or guaranteed target-size achievement.
- Redaction security beyond non-extractability of the synthetic target text in one automated case.
- Full sanitization/security audit of every hidden-data structure.
- Password-protected documents and severely corrupted files beyond one malformed PDF check.
- Human pilot tester completion, unaided completion rate, operator identity/contact, privacy/terms legal review, public launch approval, sitemap/indexing changes, and remote analytics decisions.

Private access and noindex are intentionally retained. The old cache-first service worker remains retired; old PrivyPDF shell caches are cleared on activation. This removes cached app shells, not user documents. Full offline support is not claimed.
