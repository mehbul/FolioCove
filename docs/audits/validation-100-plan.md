# PrivyPDF 100-Case Validation Program

> **For agentic workers:** Implement this plan in small reviewed slices. Use the repository's existing Playwright conventions, preserve product behavior while building the validation harness, and treat a failing assertion as defect evidence rather than weakening the oracle.

**Goal:** Build an executable release gate containing exactly 100 tool/input cases: ten meaningful cases for each of PrivyPDF's ten core tools.

**Architecture:** Playwright drives the generated `dist/` app as a user would. Synthetic fixture factories create documents and photos with known markers; independent Node-side oracles inspect every download with `pdf-lib`, PDF.js, structural object checks, rendered-pixel checks, and the existing network/privacy guard. Deterministic cases run in Chromium CI, high-risk cases repeat in installed Chrome and Edge, and OCR model cases run in a separately reported model-enabled lane.

**Tech stack:** Node.js 24, Playwright 1.63, `pdf-lib` 1.17.1, `pdfjs-dist` 6.3.289, built-in `crypto`/`zlib`, and existing locally bundled browser assets.

## Global constraints

- Keep all inputs synthetic. Never put a user document, real name, email, identifier, or customer data in a fixture, screenshot, trace, or report.
- Do not add an upload endpoint, remote analytics, account flow, or new product dependency merely to make a test pass.
- Build before browser validation. Tests exercise generated `dist/`, not source files directly.
- Every browser case installs the existing request/page-error guard before navigation. No document marker or filename may appear in a request URL or body. The only permitted external request is the documented English OCR model GET.
- A success case must produce exactly one expected download, a positive status, a re-enabled action button, and an independently valid artifact. “A file downloaded” is never enough.
- A rejection case must produce no download, a visible error naming the input or parameter category, no uncaught page error, and a usable UI afterward.
- Do not accept the current behavior when it conflicts with the contract. In particular, invalid redaction pages must fail, and a “sanitized” Privacy Inspector output must not retain the structures it claims to remove.
- Keep the unrelated current `.gitignore` modification intact.
- Preserve `noindex,nofollow` and the private-beta limitation notices throughout validation.

## Repository evidence reviewed

The present test stack is useful but is not the 100-case release gate:

- `npm test` passed on 2026-09-22. It verifies generated routes, syntax, privacy markers, page-range parsing, spreadsheet regressions, and 77 handler executions. Those 77 executions cover only seven handlers (`merge`, `split`, `edit`, `sign`, `rotate`, `numbers`, `reverse`) and primarily assert status, parseability, and page count.
- The Playwright suite contains 21 Chromium tests: ten route/control checks, eight workflow tests, two negative-input tests, and one opt-in OCR test. Several workflows combine two tools in one test, so one failure can hide the second tool's result.
- Existing browser assertions cover one representative success for each core workflow, plus a wrong-type merge input and a malformed split input. They do not prove geometry, output quality, full sanitization, encrypted-input behavior, the 100 MB gate, or broad per-tool error recovery.
- `TEST_RESULTS.md` already records the missing areas: Safari/mobile/camera hardware, visual fidelity, OCR accuracy, target-size achievement, redaction security, and complete hidden-data cleanup.
- The audit probe in `docs/audits/security-probe-results.json` found two current P0 behaviors that the matrix must reproduce: redaction page `99` downloads a successful but unredacted PDF, and Privacy Inspector's sharing copy retains catalog XMP, a form value, and an orphaned JavaScript action object.
- A local `npm run test:e2e` attempt on 2026-09-22 could not launch Playwright Chromium because the managed environment denied the executable with `browserType.launch: spawn EPERM`. All 20 deterministic tests failed in browser setup before their test bodies. This is an execution-environment blocker, not evidence of an application regression; rerun on CI or an unsandboxed local Windows shell.

## Required shared assertions and evidence

These assertions apply to every matrix row unless the row explicitly narrows them:

1. Open the dedicated route and assert the expected tool title, limitation notice, input `accept` value, and `noindex,nofollow`.
2. Attach the page/network guard before `goto`; assert zero uncaught page errors, zero unapproved external requests, and zero filename/marker leakage.
3. Start a download watcher before clicking. Success expects one named download; rejection expects no download within 1.5 seconds.
4. For PDF output, load it with both `PDFDocument.load()` and PDF.js. Assert page count, page geometry, markers, structure, and rendered pixels appropriate to the case.
5. Record the case ID, browser project, duration, status text, output byte count, and oracle results. Store traces/screenshots/output files only on failure, except visual-oracle cases, which attach input/output render pairs.
6. Use unique marker families per case, such as `PVP-M01-A`, so ordering and leakage assertions cannot pass accidentally.
7. Ordinary cases have a 20-second processing budget, 50-page stress cases 75 seconds, and OCR cases 90 seconds per page. A budget failure is a resource/compatibility result, not an automatic retry.

Priority and feasibility codes used below:

| Code | Meaning |
|---|---|
| P0 | Release blocker: privacy, unsafe success, corrupt output, destructive loss, or document leakage |
| P1 | Core correctness or common compatibility failure |
| P2 | Quality, boundary, stress, or usability hardening |
| A | Fully deterministic Playwright/Node automation in the Chromium CI lane |
| V | Automated, with rendered-pixel or geometry evidence attached for review |
| N | Automated in the OCR-model lane; depends on obtaining the documented English model |

## Exact 100-case matrix

### Merge PDFs — `M01`–`M10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| M01 | Merge a one-page PDF followed by a two-page PDF, each page carrying a unique marker. | `merged.pdf`; 3 pages; extracted markers occur in A1, B1, B2 order; all input page sizes preserved. | A | P1 integrity |
| M02 | Merge three PDFs containing portrait, landscape, and square pages with rotations 0°, 90°, and 270°. | 3 pages in input order; media/crop boxes and effective rotations match each source within 1 pt/0°. | A | P1 geometry |
| M03 | Merge a CCITT image-only scan with a selectable-text PDF. | Both pages render; scan dark-pixel ratio remains in its fixture band; text marker remains extractable only on the text page. | V | P1 decoder/content loss |
| M04 | Merge a filled form page and a page with a link annotation. | Output renders the filled value and linked region; no blank widgets; structural report states whether widgets remain interactive so silent visible loss fails. | V | P1 form/annotation loss |
| M05 | Merge a committed synthetic Unicode-font PDF with an ASCII PDF. | Unicode glyph region remains visually nonblank and matches the source render; ASCII marker extracts; no font errors. | V | P1 font compatibility |
| M06 | Merge a 50-page marker PDF with a one-page PDF. | 51 pages, exact first/middle/last ordering, completion within 75 seconds, progress/UI returns to idle. | A | P2 resource |
| M07 | Merge a blank-page PDF between two marked PDFs. | 3 pages; middle page renders white while surrounding markers remain in correct order; no page is silently dropped. | V | P1 data loss |
| M08 | Select only one valid PDF. | Run button remains disabled, no processing metric completion, no download, and adding the second file enables the run. | A | P1 UX/guard |
| M09 | Merge one valid PDF and one truncated `%PDF` file. | Visible processing error, no partial merge download, controls recover, original valid file remains listed. | A | P0 misleading success |
| M10 | Select a valid-looking PDF whose file size is 100 MiB + 1 byte. | Exact beta-limit error, no parser attempt/download, no marker leakage, controls recover. | A | P0 resource/limit |

### Extract pages — `S01`–`S10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| S01 | Five-page PDF; keep `2-3`. | `extracted-pages.pdf`; 2 pages; page-2 and page-3 markers in order. | A | P1 integrity |
| S02 | Six-page PDF; keep `1, 3, 5-6`. | 4 pages in requested order with exact markers and source dimensions. | A | P1 parser/order |
| S03 | Six-page PDF; keep overlapping `1-3, 2, 3-4`. | Duplicate page references are de-duplicated consistently to pages 1–4; status does not overstate page count. | A | P2 boundary |
| S04 | Mixed-size, mixed-rotation PDF; keep first and last pages. | Output boxes, rotation, render orientation, and markers match selected source pages. | V | P1 geometry |
| S05 | Three-page scan containing CCITT, grayscale, and color-image pages; keep page 2. | One rendered page with nonwhite content and no decoder/network failure. | V | P1 decoder |
| S06 | Filled form/annotation PDF; extract the populated page. | Visible field value and annotated region remain rendered; output opens in both parsers; structural losses are reported. | V | P1 hidden/visible loss |
| S07 | Exercise empty, `0`, `3-1`, nonnumeric, and past-end ranges as substeps on a five-page PDF. | Each input produces a range-specific visible rejection and no download; a subsequent valid range succeeds. | A | P1 validation |
| S08 | One-page PDF; keep `1`. | One page, unchanged marker and geometry; validates the lower boundary. | A | P2 boundary |
| S09 | Password-protected synthetic PDF; request page 1. | Clear encrypted/password-protected error and no download; no raw exception or stuck busy state. | A | P0 misleading success |
| S10 | Truncated PDF; request page 1. | Clear unreadable-file error, no download, and the run button is usable after replacing the file. | A | P0 corrupt input |

### Visual page organizer — `O01`–`O10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| O01 | Three pages; move page 1 later with the button. | Thumbnail order changes to 2,1,3; output markers follow 2,1,3. | A | P1 order |
| O02 | Three pages; rotate page 2 clockwise once. | Thumbnail updates; output page 2 effective rotation advances 90° and other pages remain unchanged. | V | P1 geometry |
| O03 | Four pages; remove page 2. | Three thumbnails and three output pages with markers 1,3,4. | A | P1 destructive action |
| O04 | Five pages; reorder, rotate two pages, and delete one before applying. | Exact final page/rotation manifest matches output; no operation is lost after thumbnail redraws. | V | P0 compound integrity |
| O05 | One-page PDF; try to remove the only page and move it beyond each boundary. | “Keep at least one page” appears; one thumbnail remains; apply still creates the original page. | A | P1 destructive guard |
| O06 | Four pages; use drag-and-drop to move page 4 to position 1. | DOM thumbnail order and output order are 4,1,2,3; drag state clears. | A | P1 interaction |
| O07 | Mixed portrait/landscape/rotated pages. | Every thumbnail is nonblank, page numbers are unique, and output preserves each selected page's dimensions plus requested rotation. | V | P1 preview fidelity |
| O08 | 50-page PDF; wait for all thumbnails, then move the last page first. | 50 distinct thumbnails, run enables only after valid organizer state, output begins with marker 50, completes within 75 seconds. | A | P2 resource/race |
| O09 | Password-protected PDF. | Preview reports readable/unencrypted requirement, run stays disabled, and no output is possible. | A | P0 unsafe fallback |
| O10 | Truncated PDF. | Preview error, zero thumbnails, run disabled, no download, and replacing it with a valid PDF renders successfully. | A | P0 corrupt input/recovery |

### Compress to target size — `C01`–`C10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| C01 | Two-page selectable-text PDF; target 500 KB. | `target-compressed.pdf`; 2 pages; parseable render; status reports actual KB; output is at or below 500 KB when the fixture is defined as reachable. | V | P1 target contract |
| C02 | Image-heavy three-page PDF; target 500 KB. | Output at/below target, correct page count, each page's content-region dark-pixel ratio remains above the fixture minimum. | V | P1 quality |
| C03 | Deliberately incompressible image PDF; target 200 KB. | Parseable smallest candidate; if above target, status explicitly says the target could not be reached; never claims success at 200 KB. | V | P0 misleading success |
| C04 | Run one stable source through 200 KB, 500 KB, 1 MB, 2 MB, and 5 MB options. | Status byte report matches actual output within rounding; tighter targets never produce a larger chosen result than the same source's looser search result without explanation. | A | P2 selection algorithm |
| C05 | Mixed-size and rotated five-page PDF; target 1 MB. | Five output pages render in source order; aspect ratios and effective orientation match within tolerance. | V | P1 geometry |
| C06 | Filled form with selectable text and a link; target 1 MB. | Output contains no interactive form/annotation and no selectable marker, matching the visible lossy notice; visual field value remains legible. | V | P1 disclosed data loss |
| C07 | CCITT image-only scanned PDF; target 500 KB. | Decoder assets stay same-origin; output render contains the expected nonwhite scan ratio. | V | P1 decoder |
| C08 | 50-page mixed-content PDF; target 5 MB. | 50 pages, page-order markers visible in sampled renders, progress advances, completion within 75 seconds or a classified resource failure. | A | P2 memory/time |
| C09 | Password-protected PDF. | Clear encrypted-input error, no download, and no false “closest result” message. | A | P0 misleading success |
| C10 | Truncated PDF. | Clear unreadable-file error and no download; subsequent valid compression succeeds in the same page. | A | P0 recovery |

### Camera document scanner — `SC01`–`SC10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| SC01 | Bordered PNG document photo; document enhancement and trim on. | `camera-scan.pdf`; one page; output dimensions shrink from source border bounds; text-line pixels remain; grayscale/high-contrast band achieved. | V | P1 crop/quality |
| SC02 | Two portrait photos with distinct top markers, selected in order. | Two pages in selection order; marker regions distinguish page 1 from page 2. | V | P1 order |
| SC03 | Color JPEG; color mode, trim off. | One page with source aspect ratio; sampled red/blue patches retain measurable channel separation. | V | P1 color fidelity |
| SC04 | Valid WebP document image. | Accepted without type error; one parseable, nonblank PDF page. | V | P1 format compatibility |
| SC05 | Color PNG; grayscale mode. | Output channels are within the grayscale tolerance in sampled content regions while edges remain visible. | V | P2 enhancement |
| SC06 | Run the same bordered photo once with trim on and once off. | Trimmed page is smaller in both dimensions; normalized content bounding box is not clipped; untrimmed page matches source dimensions. | V | P1 trimming |
| SC07 | All-white/near-white image with trim on. | No zero-size canvas or crash; output is a valid full-frame white page and status does not claim detected document edges. | V | P2 edge case |
| SC08 | Landscape and portrait photos in one selection. | Two pages preserve each image's orientation and aspect ratio independently. | V | P1 geometry |
| SC09 | Corrupt bytes named `.png` with MIME `image/png`. | File is accepted by type filter, processing then yields a clear unreadable-image error and no download. | A | P0 misleading success |
| SC10 | TXT/PDF wrong type, then a 100 MiB + 1 byte synthetic `.jpg`. | Wrong type is rejected at selection; oversized valid-type file gets the exact beta-limit error on run; neither downloads. | A | P0 input/limit |

### Searchable OCR PDF — `OC01`–`OC10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| OC01 | One clean high-contrast image-only page reading `LOCAL SCAN ALPHA`. | `searchable-ocr.pdf`; source has no extractable marker; output contains all three normalized words and preserves the page render. | N/V | P1 core accuracy |
| OC02 | Two image-only pages with disjoint word sets. | Two pages; each page's extracted text contains its own word set and not the other page's full phrase. | N | P1 page mapping |
| OC03 | Image-only page stored with 90° page rotation. | Output orientation matches the displayed source; expected English phrase recall is at least 80%. | N/V | P1 rotation |
| OC04 | Low-contrast gray text plus a high-contrast control phrase. | Control phrase recall is 100%; low-contrast recall is measured and must meet the fixed fixture threshold of 60%, with the render preserved. | N/V | P1 accuracy |
| OC05 | Invoice-like digits and punctuation: date, amount, and reference. | Normalized output contains the reference digits, date digits, and amount digits; no page loss. | N | P1 business accuracy |
| OC06 | Mixed PDF: one selectable-text page and one image-only page. | Two visual pages preserved; OCR text from both known phrases is searchable; no duplicate extra page. | N/V | P1 mixed content |
| OC07 | CCITT scan containing block text. | Same-origin PDF.js decoder assets; output nonblank; expected English keyword recovered. | N/V | P1 decoder/model |
| OC08 | Mixed English and Devanagari image-only page. | English control phrase meets 80% recall; visual page is preserved; the visible English-only limitation remains present; no assertion promises Devanagari recognition. | N/V | P2 honest boundary |
| OC09 | Password-protected PDF. | PDF rejection occurs before an OCR download; clear encrypted-input error; no output and no needless document-marker request. | A | P0 unsafe success |
| OC10 | Truncated PDF. | Clear unreadable-file error, no OCR output, no stuck worker/progress state. | A | P0 recovery |

### Edit PDF — `E01`–`E10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| E01 | Two-page PDF; add `ADDED-E01` to page 2 at 10%,10%. | `edited.pdf`; marker extracts only on page 2; original markers/pages preserved. | A | P1 core correctness |
| E02 | Add four short markers near 5%,5%, 80%,5%, 5%,90%, and 80%,90% in separate runs. | PDF.js text transforms place each marker within ±3% of requested normalized coordinates and inside its page box. | V | P1 placement |
| E03 | Add text to a 90° rotated page. | Marker is visible inside displayed page bounds and extracts from the selected page; original rotation remains effective. | V | P1 rotation/placement |
| E04 | Add a long line near the right edge of a narrow page. | Rendered text bounding box remains on-page or the tool rejects with a clear bounds message; clipped silent success fails. | V | P1 content loss |
| E05 | Add text over an image-only scanned page. | New text extracts; background render remains within pixel-difference tolerance outside the text box. | V | P1 overlay fidelity |
| E06 | Add text to a filled-form/annotation PDF. | Original visible field/annotation appearance remains; new text extracts; structure report catches unexpected form/annotation loss. | V | P1 collateral loss |
| E07 | Submit an empty/whitespace text value. | “Enter text to add” error and no download; entering valid text afterward succeeds. | A | P1 validation |
| E08 | Exercise page `0` and page greater than count. | Browser validity blocks zero; past-end value produces the exact page-range error; neither downloads. | A | P0 wrong-page edit |
| E09 | Enter characters outside StandardFonts' WinAnsi coverage. | Either the exact glyphs render/extract or the tool returns a clear limited-character error and no download; a raw encoding exception or replacement-glyph success fails. | A/V | P1 Unicode |
| E10 | Run against password-protected and truncated PDFs as two rejection substeps. | Each is classified clearly, creates no output, and leaves the page recoverable with a valid replacement file. | A | P0 corrupt/encrypted |

### Sign PDF — `SG01`–`SG10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| SG01 | One-page PDF; signer `Ada Test`, bottom left. | `signed.pdf`; `Signed by Ada Test` and frozen test date extract; text and line remain inside left page bounds. | V | P1 core correctness |
| SG02 | One-page PDF; bottom right. | Signature's PDF.js text box ends at least 24 pt before the right edge and line stays on-page. | V | P1 placement |
| SG03 | Five-page PDF; sign page 5. | Signature/date appear only on page 5; all original pages and markers remain. | A | P1 page selection |
| SG04 | Mixed-size PDF with a rotated selected page. | Visual signature is within the displayed bottom region and original effective rotation remains. | V | P1 geometry |
| SG05 | Signer name with spaces, apostrophe, period, and hyphen. | Exact label extracts and no characters are dropped. | A | P2 names |
| SG06 | Very long signer name on the narrowest supported page. | Entire signature remains visible/on-page or the tool rejects with a bounds message; clipped silent success fails. | V | P1 misleading output |
| SG07 | Signer name outside WinAnsi coverage. | Exact glyphs render or a clear character-support error produces no download; raw exception/replacement glyphs fail. | A/V | P1 Unicode |
| SG08 | Empty/whitespace signer name. | “Enter the signer name” error, no download, and a valid retry succeeds. | A | P1 validation |
| SG09 | Exercise page `0` and page beyond count; inspect a valid signed output for signature dictionaries. | Invalid pages do not download; valid output contains no `/Type /Sig` field or cryptographic signature dictionary, consistent with the typed-signature notice. | A | P0 false security claim |
| SG10 | Password-protected and truncated PDFs as rejection substeps. | Clear classified errors, no signed output, no stuck job. | A | P0 unsafe success |

### Secure redact — `RD01`–`RD10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| RD01 | One-page PDF with `SECRET-RD01` inside a known box; redact that box. | `securely-redacted.pdf`; target text is not extractable; target render is at least 95% black; outside control marker remains visually present. | V | P0 confidentiality |
| RD02 | Two pages with target only on page 2; redact page 2. | Page 2 target box black; page 1 has no black-box change outside rasterization tolerance; 2 pages remain. | V | P0 wrong-page redaction |
| RD03 | Targets near top-left, top-right, bottom-left, and bottom-right in separate runs. | Each requested normalized box is black within ±3 px and adjacent control patches remain visible. | V | P0 coordinate accuracy |
| RD04 | Full-page region on a synthetic page. | Selected page is at least 98% black and parseable; no source text extracts anywhere from that page. | V | P0 boundary |
| RD05 | Target on a page rotated 90°. | The displayed target, not the unrotated coordinate counterpart, is black; visual orientation remains correct. | V | P0 rotation/coordinates |
| RD06 | Mixed page sizes; redact page 3 with the same normalized region. | Only page 3's normalized target is black; all page dimensions/aspect ratios remain correct. | V | P0 geometry |
| RD07 | Image-only/CCITT scan with a high-contrast synthetic secret patch. | Secret patch is black; neighboring scan pixels remain; decoder stays same-origin. | V | P0 scanned content |
| RD08 | Exercise page `0` and page `99` on a one-page input. | Both reject with a page-range error and no download. Current page-99 successful download is a known release blocker. | A | P0 unsafe success |
| RD09 | Password-protected PDF. | Clear encrypted-input error, no redacted download, no positive completion metric. | A | P0 unsafe success |
| RD10 | Truncated PDF. | Clear unreadable-file error, no download, and a valid retry works. | A | P0 recovery |

### Privacy Inspector — `PI01`–`PI10`

| ID | Fixture and action | Expected assertions | Feasibility | Priority / risk |
|---|---|---|---|---|
| PI01 | PDF with title, author, subject, keywords, creator, and producer. | Report count is correct; `safe-to-share.pdf` returns empty values for all public metadata getters and does not contain the marker bytes. | A | P0 hidden data |
| PI02 | PDF with a catalog `/Metadata` XMP stream containing `PRIVATE_XMP_PI02`. | Report identifies metadata; sanitized catalog has no `/Metadata`; no indirect object or raw output bytes contain the marker. Current output retains it. | A | P0 hidden data |
| PI03 | PDF with URI link and text annotation. | Report counts affected page; sanitized page has no `/Annots`; annotation/URI markers are absent from all indirect objects; visible base page remains. | A/V | P0 hidden action |
| PI04 | Filled text field and checkbox with private markers. | Report gives correct field count; sanitized output has zero form fields, no widget annotations, no `/AcroForm`, and no field-value marker bytes. Current output retains fields. | A | P0 hidden data |
| PI05 | Catalog `/OpenAction`, catalog `/AA`, and page `/AA` JavaScript actions with unique markers. | Report detects automatic actions; sanitized dictionaries and all reachable/orphan indirect objects contain no action markers. Current output leaves an orphan action object. | A | P0 active content |
| PI06 | `/Names` tree with an embedded-file marker. | Report detects named resources/embedded content; sanitized catalog has no `/Names`; embedded stream marker is absent from every output object/byte sequence. | A | P0 attachment leakage |
| PI07 | Combined dirty fixture containing PI01–PI06 structures. | One sanitized copy passes every structural/byte oracle, preserves page count and visible public text, and reports each category accurately. | A/V | P0 compound sanitization |
| PI08 | Combined dirty fixture with “Download a sanitized sharing copy” unchecked. | Report appears; no download event; source fixture hash is unchanged; status does not say a sharing copy was created. | A | P1 user choice |
| PI09 | Clean PDF with no hidden structures. | Report shows zeros/no actions/no names; optional sanitized output is parseable, visually equivalent, and does not introduce metadata. | A/V | P1 false positives |
| PI10 | Password-protected and truncated PDFs as rejection substeps. | Clear errors, no report claiming safety, no download, and no raw parser exception. | A | P0 false assurance |

## Fixture generation and independent oracles

Create deterministic fixtures at test time under each Playwright test's output directory. Do not commit generated PDFs, photos, or downloads. Two small provenance-controlled binary fixtures are acceptable when browser APIs cannot generate them reliably: a password-protected PDF and a Unicode-font PDF. Store them under `tests/fixtures/`, add a `README.md` describing the synthetic contents and generation command, and verify their SHA-256 in the fixture loader.

Add these focused files:

- Create `tests/e2e/validation/fixture-factory.mjs`: PDF page/text/image factories; mixed boxes/rotations; blank pages; forms; annotations; XMP; actions; name trees/attachments; truncated and oversized inputs; PNG/JPEG/WebP photo generators; high/low contrast OCR pages.
- Create `tests/e2e/validation/oracles.mjs`: dual-parser PDF open, per-page text, boxes/rotations, catalog/object scan, form/annotation/action checks, PDF page rendering, pixel-region statistics, image difference, SHA-256, and `expectNoDownload`.
- Create `tests/e2e/validation/harness.mjs`: open route, install guards, select fixtures, run/download, collect status, enforce success/rejection contracts, and attach evidence.
- Create one spec per tool under `tests/e2e/validation/`: `merge.spec.mjs`, `split.spec.mjs`, `organize.spec.mjs`, `compress.spec.mjs`, `scan.spec.mjs`, `ocr.spec.mjs`, `edit.spec.mjs`, `sign.spec.mjs`, `redact.spec.mjs`, and `privacy-inspector.spec.mjs`.
- Create `tests/e2e/validation/matrix.mjs`: the 100 IDs, tool, priority, risk, and feasibility metadata from this document.
- Create `scripts/check-validation-100.mjs`: fail unless there are exactly 100 unique IDs, exactly ten per tool, required metadata on every row, and exactly one spec registration for every ID.
- Modify `tests/e2e/helpers.mjs` only to reuse stable existing helpers; move generalized new behavior into the validation modules so the current 21-test suite remains readable.
- Modify `package.json` with `test:validation:matrix`, `test:validation`, `test:validation:ocr`, and `test:validation:installed` scripts. `test:validation` excludes `N` rows; the OCR script runs `OC01`–`OC08` explicitly.
- Modify `.github/workflows/ci.yml` only after the deterministic Chromium lane is stable: build, run existing tests, run the matrix count check, then run all `A`/`V` validation rows in Chromium. Keep OCR model cases in a scheduled/manual job until the model source is cached and checksum-controlled.

Low-level PDF fixtures should use `pdf-lib`'s context APIs, following the existing audit probe. Every private structure gets its own marker. Sanitization checks must scan both catalog reachability and all serialized indirect objects because deleting a dictionary key can leave sensitive orphan objects in the saved file.

For visual fixtures, generate simple high-contrast geometry whose expected pixels are calculable: solid color patches, thick black text bars, white borders, and known target rectangles. Compare regions, not whole-page golden screenshots, to avoid browser antialiasing noise. Use source/output render pairs at the same pixel dimensions and exclude the intended edit/sign/redaction box when checking collateral changes.

For OCR, continue using the documented `https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz` request. The OCR lane should cache the fetched model outside Git, record its SHA-256 and byte length in the test report, and fulfill later runs from that cache through Playwright routing. A changed hash is a hard failure requiring dependency review. Document-model fetches remain allowed; document markers in that request remain forbidden.

## Browser and device coverage

| Lane | Cases | Gate |
|---|---|---|
| CI Playwright Chromium | All 92 `A`/`V` rows | Required on every change touching `src/app`, launch code, build, routes, dependencies, or validation code |
| OCR-model Chromium | `OC01`–`OC08` | Required before a release candidate; separately reported when model retrieval/cache is unavailable |
| Installed Chrome + Edge on Windows | Every P0 row plus M01, S01, O01, C01, SC01, OC01, E01, SG01 | Required before release; use `channel: chrome` and `channel: msedge` |
| Chromium mobile emulation at 375×812 and 412×915 | Ten direct routes; O05/O06, SC01/SC02, E02, SG02, RD03, PI08 | Required for responsive/control reachability; does not prove mobile Safari/Chrome |
| Playwright WebKit | Ten direct-route checks and non-OCR P0 rejection cases | Compatibility signal only; do not label it Safari coverage |
| Physical iOS Safari and Android Chrome | One successful task per core tool plus real camera capture for `SC01`/`SC02` equivalents | Human/device gate; record case ID, OS/browser version, completion, output inspection, and assistance needed |
| Desktop Safari | Ten core success tasks using the same synthetic fixtures | Human/device gate unless a real macOS runner is added |

Never multiply all 100 cases across every browser by default. Chromium provides depth; installed-browser P0 repetition catches engine/channel differences without making the release gate prohibitively slow. Any browser-specific failure promotes its adjacent cases into that browser's regression set.

## Phased implementation plan

### Phase 0: Preserve and measure the baseline

- [ ] Run `npm ci`, `npm run build`, and `npm test`; save exact versions and results in the validation report.
- [ ] Run `npx playwright test tests/e2e/routes.spec.mjs --project=chromium`. If browser launch returns `spawn EPERM`, record the environment blocker and rerun on CI or an unsandboxed host before interpreting app health.
- [ ] Run `node scripts/check-validation-100.mjs` after the manifest is created; expected result is `100 cases; 10 per tool; 0 duplicate or unregistered IDs`.

### Phase 1: Build the P0 privacy/output slice

- [ ] Implement shared fixture/oracle/harness modules with object-marker scanning, PDF rendering, pixel regions, no-download checks, and guard installation.
- [ ] Implement `RD01`–`RD10` and `PI01`–`PI10` first.
- [ ] Run those 20 in Chromium. Preserve failing output only under `test-results/`; do not soften the known `RD08`, `PI02`, `PI04`, `PI05`, or `PI07` assertions.
- [ ] File or fix product defects separately from the test commit, then rerun the exact failed case and its whole ten-case tool group.

### Phase 2: Add document-integrity tools

- [ ] Implement `M01`–`M10`, `S01`–`S10`, and `O01`–`O10`.
- [ ] Add the password-protected and Unicode fixture provenance files.
- [ ] Run 30 cases in Chromium, then repeat all P0 rows from these groups in installed Chrome and Edge.

### Phase 3: Add geometry and quality tools

- [ ] Implement `C01`–`C10`, `SC01`–`SC10`, `E01`–`E10`, and `SG01`–`SG10`.
- [ ] Attach normalized input/output renders for every `V` case and keep numeric thresholds in fixture metadata beside the generator.
- [ ] Run the 40 cases in Chromium and the selected P0/common-success installed-browser subset.

### Phase 4: Add OCR and full orchestration

- [ ] Implement `OC09` and `OC10` in the deterministic lane first.
- [ ] Implement the OCR model cache/router, record model hash/size, then add `OC01`–`OC08` to the separate OCR lane.
- [ ] Add the four npm scripts and CI matrix/count gate. Keep the existing `npm test` and 21-test E2E suite running during migration; remove duplication only after the 100-case suite is stable and reviewed.

### Phase 5: Release evidence

- [ ] Run build, existing tests, all 92 deterministic validation rows, eight OCR rows, installed Chrome/Edge subset, mobile emulation, and device checks.
- [ ] Produce a machine-readable JSON summary and a short Markdown ledger grouped by tool and case ID. Include pass/fail/blocked, browser, duration, output bytes, oracle values, and evidence path without document contents.
- [ ] Release gate: 100/100 have a recorded result; zero open P0 failures; no misleading safe/success download; no unapproved network request; all blocked device/model cases have an owner-visible reason and are not counted as passes.

## Highest-value first implementation slice

Implement the harness plus `RD01`–`RD10` and `PI01`–`PI10` first. This 20-case slice exercises the hardest independent oracles—rendered regions, serialized-object scans, action/form/attachment removal, and no-download error handling—and directly captures the known unsafe-success defects. Once it is trustworthy, the same fixture and oracle foundation makes the remaining 80 cases mostly tool-specific assembly rather than new test infrastructure.
