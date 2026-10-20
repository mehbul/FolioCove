# Word conversion appearance fix — 20 October 2026

## Problem and change

DOCX-to-PDF used Mammoth raw-text extraction followed by a new standard-font PDF. PDF-to-DOCX reconstructed extracted text as paragraphs. Both intentionally removed source formatting, but this did not meet visitors' appearance expectations.

Both Word tools now default to **Keep appearance (page images)**. PDF-to-DOCX uses PDF.js to render each source page, retaining page dimensions in a native DOCX. DOCX-to-PDF uses locally bundled docx-preview and html2canvas, embedding rendered page images in PDF. Text is not editable/selectable in these modes. An explicit editable-text mode retains the previous text-oriented behavior. The legacy PDF-to-Word alias now downloads native document.docx instead of an HTML .doc wrapper.

DOCX rendering is approximate: unavailable fonts can substitute, complex layouts and pagination can differ, long content can split across page boundaries, and accessibility/searchable text is not retained. It is not an editable Office reconstruction or Microsoft Word-equivalent print engine. Exact Office printing should use the source editor's PDF export.

External DOCX relationships are removed before rendering. The isolated rendering document restricts resources with CSP, disables HTML altChunks, and uses local/data assets. A referenced external or unrenderable image stops export with an error rather than silently dropping the image. Frame cleanup runs on success and failure. Selected documents are not uploaded.

## Verification

- Regression first failed because the appearance option did not exist.
- npm run build; npm test: passed, including 77 generated-bundle handler checks.
- node scripts/test-ai-readiness.mjs: all 88 registry entries passed.
- Focused root Chromium conversion/extended-tool suite: 14 passed before final external-image regression; final three conversion regressions passed separately.
- GitHub Pages browser suite: 36 passed.
- New conversion checks on Android Chromium emulation, iPhone WebKit emulation and desktop WebKit: six passed.
- Two-page PDF → DOCX → PDF: matching page count/dimensions, per-page images, mean pixel-channel difference below 4/255.
- Independent styled DOCX: two pages, colored heading, blue table cell, separately measured header/footer regions, explicit page break. Rendered output inspected visually.
- Actual referenced external image: no network fetch, no download, visible error and rendering-frame cleanup.
- Editable-text route regressions still verify actual extracted content in DOCX and PDF.

These are synthetic-document browser checks. They do not establish all Word-template fidelity, physical-device downloads/camera behavior or Apple Safari-app behavior. No customer document was used.
