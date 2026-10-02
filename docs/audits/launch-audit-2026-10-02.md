# FolioCove launch audit — 2 October 2026

Verdict: ready for a controlled private pilot with synthetic or non-sensitive documents. Not yet ready for an unrestricted public launch or a claim that all iLovePDF features are fully supported.

Operator name supplied: FolioCove. Country supplied: India. Public support email: not yet set up. No email address was invented. Hosting remains owner-private.

## What was checked

- All 88 catalog tools received one representative synthetic input. 75 produced parseable downloads, 10 produced reports/previews, and 3 reported expected limitations (sanitization, browser AI summary, browser translation). No unresolved execution errors in this run. Parseability alone does not prove fidelity or accuracy.
- Focused Chromium browser suite: 37 passed, including output page counts/order, text edits/signatures, encryption round trip and incorrect password, form creation, native DOCX/XLSX/PPTX containers, PDF.js scan rendering, OCR independently extracted text, redaction sample, wrong types, malformed PDF, CSV formula escaping, and AI unavailability.
- Installed Chrome and Edge smoke tests: 6 passed (merge/split output and wrong/malformed file handling). These are smoke checks, not the entire catalog on each browser.
- Mobile Chromium emulation: 20 route/control checks passed at 375×812 and 412×915. This does not prove physical mobile, camera permissions or Safari support.
- Desktop/mobile design review: 35 discovery cards, local DM Sans loaded, no horizontal overflow, no missing images, no page errors; category filtering, search, empty state, forms and direct workspace checked. No further full redesign is needed to begin the pilot.
- Build and local regression suite passed. The 77 handler executions in npm test cover repeated cases across generated PDFs; they are not 77 distinct tools.
- npm audit: zero known dependency advisories at audit time. This is not proof of absence of vulnerabilities.
- Network guards on the catalog run: no document marker/filename transmission violations and no page errors. Security probe: no external requests for injected HTML, no injected script execution, no remote document processing found in the implementation. OCR and browser-managed AI models can still make model download requests.
- Current host returned 401 to an unauthenticated request; native access metadata confirms only the owner is allowed. Protected-content hosting headers and provider request-log retention were not independently verified.

## Fixes made during this audit

- AI APIs check model availability and bound pending availability/create/process operations. Unsupported model placeholder text cannot be downloaded as a successful summary. Models that finish creating after a timeout are destroyed. Translation models are destroyed after use.
- RTF/other supported file imports accept expected extensions when the browser supplies an empty or generic MIME type. RTF aliases application/msword and text/plain are handled. Actual parsing still checks document validity.
- Corrected ambiguous legacy CSV test selection and scrolled the drawing canvas into view before automated signing.
- Isolated mobile test artifact output to avoid concurrent suite cleanup collisions; the affected mobile suite was rerun successfully.
- Added FolioCove/India to beta notices, retained the missing-email status, and disclosed browser-managed summary models in privacy copy.

## Remaining before public launch

1. Set up and verify a public support inbox. Then finish the public privacy/terms notices with the actual operator/contact details and confirmed hosting/provider information. Current notices explicitly remain beta drafts.
2. Run a short physical-device pilot: Android Chrome and iPhone Safari, desktop Safari if available, actual camera permission/capture, download/open behavior, and one task without guidance. No 100-case validation matrix is required for this focused pilot.
3. Keep capability limits visible. AI summary/translation depend on browser models and were unavailable in the tested environment. Verified sanitization and PDF/A conversion are unavailable. Signature requests, automatic form detection, editable PowerPoint reconstruction, layout-perfect Office conversion and layout-preserving translation are not implemented.
4. Keep redaction labelled experimental until a broader independent output check is completed. The tested region removed the target text; that does not establish every unusual PDF or hidden-object case. Header overlays and standard metadata cleanup are not secure redaction/sanitization.
5. Public release requires an explicit access change, public SEO configuration and a check of the resulting anonymous routes. Those steps have not been performed during this private audit.

## Residual limits

Large and unusual PDFs can exhaust device memory. The app has a 100 MB per-file gate, not an aggregate-memory guarantee. Recovery was tested with a readable representative PDF, not a corpus of corrupted files. This audit does not establish OCR accuracy across languages/scans, production accessibility conformance, exhaustive graphical differences, every Office layout, real user completion, or independent security certification.

## Tool-by-tool representative results

“Download parsed” means the output PDF/container could be opened structurally; text/image downloads were checked for creation and size. “Report / preview” means a status or local preview appeared. Consult /limitations/ for actual fidelity.

| Tool | Representative result | Output / status |
| --- | --- | --- |
| Merge PDFs | Download parsed | PDF · 6 pages |
| Extract pages | Download parsed | PDF · 1 pages |
| Compress to target size | Download parsed | PDF · 3 pages |
| PDF to Word (DOCX) | Download parsed | .docx |
| PDF to Excel (XLSX) | Download parsed | .xlsx |
| PDF to PowerPoint | Download parsed | .pptx |
| Word to PDF | Download parsed | PDF · 1 pages |
| Excel to PDF | Download parsed | PDF · 1 pages |
| PowerPoint to PDF | Download parsed | PDF · 1 pages |
| PDF to JPG | Download parsed | .zip |
| Images to PDF | Download parsed | PDF · 1 pages |
| Edit PDF | Download parsed | PDF · 3 pages |
| Add PDF shapes | Download parsed | PDF · 3 pages |
| Sign PDF | Download parsed | PDF · 3 pages |
| Draw signature / freehand | Download parsed | PDF · 3 pages |
| Create PDF forms | Download parsed | PDF · 3 pages |
| Fill PDF forms | Download parsed | PDF · 3 pages |
| Protect PDF | Download parsed | PDF |
| Unlock PDF | Download parsed | PDF · 3 pages |
| Watermark | Download parsed | PDF · 3 pages |
| Image watermark | Download parsed | PDF · 3 pages |
| Page numbers | Download parsed | PDF · 3 pages |
| Rotate PDF | Download parsed | PDF · 3 pages |
| Crop margins | Download parsed | PDF · 3 pages |
| Visual organizer | Download parsed | PDF · 3 pages |
| Searchable OCR PDF | Download parsed | PDF · 3 pages |
| Compare PDFs visually | Report / preview | Done — local previews are ready. |
| AI Summarizer | Unavailable / limited | The on-device AI model is unavailable. Use Smart summary instead. Keep the original. Try a smaller, unencrypted file; report only the tool and error category, not document contents. |
| Translate PDF text | Unavailable / limited | The on-device AI model is not ready. Retry after its browser-managed download completes, or use another local tool. Keep the original. Try a smaller, unencrypted file; report only the tool and error category, not document contents. |
| PDF to Markdown | Download parsed | .md |
| Lossless PDF compression | Download parsed | PDF · 3 pages |
| Recover damaged PDF | Download parsed | PDF · 3 pages |
| Clear info fields | Download parsed | PDF · 3 pages |
| Inspect PDF | Report / preview | 3 pages · 420 × 540 pt · Title: Synthetic audit · No author metadata |
| Quick Action | Download parsed | PDF · 3 pages |
| Organize pages | Download parsed | PDF · 1 pages |
| Flatten forms | Download parsed | PDF · 3 pages |
| PDF to PNG | Download parsed | .png |
| Edit metadata | Download parsed | PDF · 3 pages |
| Header & footer | Download parsed | PDF · 3 pages |
| Reverse pages | Download parsed | PDF · 3 pages |
| Odd / even pages | Download parsed | PDF · 2 pages |
| Interleave PDFs | Download parsed | PDF · 6 pages |
| Resize pages | Download parsed | PDF · 3 pages |
| Two-up layout | Download parsed | PDF · 2 pages |
| Bates numbering | Download parsed | PDF · 3 pages |
| Compress PDF | Download parsed | PDF · 3 pages |
| Pages to PNG ZIP | Download parsed | .zip |
| Split into ZIP | Download parsed | .zip |
| Insert blank page | Download parsed | PDF · 4 pages |
| Extract text | Download parsed | .txt |
| Reading statistics | Report / preview | 30 words · 301 characters · about 1 min read · 3 pages |
| Date stamp | Download parsed | PDF · 3 pages |
| Remove annotations | Download parsed | PDF · 3 pages |
| Add margins | Download parsed | PDF · 3 pages |
| Grayscale PDF | Download parsed | PDF · 3 pages |
| Find text | Report / preview | 3 matches · page 1 (1) · page 2 (1) · page 3 (1) |
| Compare PDFs | Report / preview | No text differences found. |
| File fingerprint | Report / preview | SHA-256: 8f84f667560317c75544d14a6460fed5f009ed8c4a4a290b5f517adfd4ea3774 |
| PDF to JSON | Download parsed | .json |
| Remove blank pages | Download parsed | PDF · 3 pages |
| OCR scanned PDF | Download parsed | .txt |
| Enhance scan | Download parsed | PDF · 3 pages |
| Remove headers/footers | Download parsed | PDF · 3 pages |
| Split scanned spreads | Download parsed | PDF · 3 pages |
| Secure redact | Download parsed | PDF · 3 pages |
| Repair PDF | Download parsed | PDF · 3 pages |
| Smart summary | Download parsed | .txt |
| HTML to PDF | Download parsed | PDF · 1 pages |
| PDF to Word | Download parsed | .doc |
| PDF to Excel | Download parsed | .csv |
| Duplicate pages | Download parsed | PDF · 4 pages |
| Delete pages | Download parsed | PDF · 2 pages |
| Split every N pages | Download parsed | .zip |
| Booklet layout | Download parsed | PDF · 2 pages |
| Four-up handout | Download parsed | PDF · 1 pages |
| Approval stamp | Download parsed | PDF · 3 pages |
| QR code stamp | Download parsed | PDF · 3 pages |
| Sanitization unavailable | Unavailable / limited | Verified sanitization is unavailable; no PDF was created. Use Privacy Inspector for a read-only report. Keep the original. Try a smaller, unencrypted file; report only the tool and error category, not document contents. |
| Extract contacts | Download parsed | .csv |
| Deskew scans | Download parsed | PDF · 3 pages |
| Camera scanner | Download parsed | PDF · 1 pages |
| Privacy Inspector | Report / preview | Privacy report • 1 populated standard Info fields • 3 pages with annotations or links • 1 interactive form fields • No automatic document actions detected • No named resource dictionary No sanitized sharing copy was created. |
| Workflow builder | Download parsed | PDF · 3 pages |
| Sensitive data finder | Report / preview | Sensitive-data report • 3 possible matches on pages 1, 2, 3 Review the result before enabling automatic redaction. |
| Document quality check | Report / preview | Quality report • 3 pages with consistent page size • No likely blank pages • Every page contains searchable text • Possible low-contrast pages: 2, 3 |
| Ask PDF locally | Report / preview | Most relevant local passages: • Page 1: Payment due Friday. • Page 2: Payment due Friday. • Page 3: Payment due Friday. |
| OpenDocument / EPUB to PDF | Download parsed | PDF · 1 pages |

Raw catalog results: docs/audits/launch-catalog-results.json. Security probe: docs/audits/security-probe-results.json. Repeatable audit: node scripts/audit-catalog.mjs with the local dev server running on port 4173.
