# Appearance conversion and page geometry — 20 October 2026

## Changes and limits

| Flow | Default behavior and boundary |
| --- | --- |
| PDF to Excel | One worksheet page image per PDF page, retaining visible content without editable cells/formulas. Explicit text/data mode keeps approximate row extraction. |
| Excel to PDF | Basic XLSX fonts, RGB colors, borders, column widths, merged cells and embedded images rendered as page images. No formula calculation; missing cached values stop conversion. Hidden sheets/rows/columns are excluded. Charts, conditional formatting, complex printing and legacy XLS appearance are unsupported. XLS text/data export remains available. |
| PowerPoint to PDF | Supported visible PPTX slide dimensions, backgrounds, positioned rich text, simple shapes and embedded pictures rendered locally. Groups, tables, charts, SmartArt, gradients and custom geometry are unsupported. Fonts and complex layout may differ. Text mode remains explicit; legacy PPT unsupported. |
| PDF to PowerPoint | Image slides now use the first PDF page dimensions, avoiding mandatory widescreen margins. Different page proportions fit without stretching; original content is not editable slide objects. |
| Local HTML to PDF | Supported local static HTML/CSS and embedded raster data images rendered to page images. Scripts/active elements and external resources are blocked; CSS imports, inline SVG/MathML and non-embedded images are unsupported. Text-only output remains available. Complex CSS/pagination can differ. |
| Target compression, grayscale workflow, OCR and experimental redaction | Raster render resolution no longer changes physical PDF page size. This does not restore searchable text, forms or accessibility lost by raster output, nor establish redaction safety. |
| PDF to JPG/PNG, image to PDF | Existing page/image rendering already preserves visual proportions; ordinary image rasterization and resolution limits remain. |
| CSV, Markdown, JSON, text import/translation | These are text/data outputs, not appearance-preserving formats. Their text-only and browser requirements remain explicit. |
| Merge, extraction, page organization and lossless compression | Existing structural PDF operations retained, with existing browser regressions. No new full-format fidelity claim. |

No remote document processing, remote AI, document upload endpoint or remote analytics was introduced. XML relationships resolve only to embedded ZIP parts; remote images are never fetched. Local HTML rendering uses a restrictive CSP and embedded-image policy. Unsupported known content reports an error rather than silently producing a successful incomplete export. These are scoped browser safeguards, not an independent security audit.

## Evidence

- Regression failed first because the conversion-mode control was absent.
- A separate physical-size regression failed at 504 points instead of the source's 420 points before the raster fix.
- Build, unit/bundle handler checks (77) and AI-readiness checks (88 registry entries) passed.
- Ten new Chromium regressions cover styled worksheets, styled slides, PDF worksheet images, HTML CSS, remote CSS blocking, hidden content, image round trips, physical page sizes, drawing anchors outside used cells and missing formula caches.
- Existing core, extended and Word workflows passed a focused 37-test run.
- Fifteen focused Android Chromium/iPhone WebKit/desktop WebKit emulation checks passed for new rendering and geometry behavior.
- Real English OCR ran with the existing allowed model host: recognized text was independently extracted and original page size verified.
- Spreadsheet and presentation output images were visually inspected. Pixel/color checks, original page dimensions and nonblank content checks support the synthetic round trips.
- Code review identified hidden content, background painting order, image-anchor coordinates and missing formula caches; these were fixed and relevant regressions added.

Source documents were synthetic. This is not the deferred 100-case fixture validation, full Office fidelity, physical-camera/native-download validation or Apple Safari-app testing. Page-image exports are not editable/selectable text and do not retain source application interactivity. Keep originals and inspect real outputs.
