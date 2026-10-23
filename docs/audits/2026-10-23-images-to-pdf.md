# Ordered pictures and PDF layout — 23 October 2026

Extends the existing `images` tool and `/jpg-to-pdf/` route. Processing uses browser canvas and pdf-lib; no file upload endpoint, document persistence, remote service or dependency was added.

## Behavior

Selection order is export order. Existing accessible file arrows/removal remain available, with draggable page-selection buttons, natural filename sort, reverse and duplication. Per-File adjustments follow the image when reordered: original/grayscale/black-and-white/document scan/sepia, brightness, contrast, saturation, sharpening, threshold, crop bounds before rotation, quarter turns, flips, auto contrast and inversion. Apply-all copies adjustments; reset affects the selected image. Preview and export share their image processor and page compositor.

The default image-sized output retains one point per source pixel (72 DPI), preserving existing page dimensions. PDF controls: image-sized/A4/A5/Letter/Legal, orientation, contain/cover/stretch, margins, background, 72–300 DPI, JPEG quality, page numbers, document title and filename. Existing prepared-download recovery and next-tool handoff are retained. Controls are inert during processing. Source metadata is not copied; white flattening precedes filters. Exports are JPEG page images, with optional PDF text page numbers.

Limits: 100 images, 20 MB and 24 megapixels each; JPG, PNG, WebP and BMP. No HEIC/TIFF conversion, OCR, perspective correction or saved-document history. Images clear on reload/navigation. Raster edges are capped at 3508 pixels; preview uses a lower resolution. Re-encoding is lossy. Physical phone camera capture, native mobile downloads and actual Safari remain unverified.

## Verification

- `npm run build`, `npm test`, `node scripts/test-ai-readiness.mjs`: passed. Test suite includes physical layout bounds for fit/fill/stretch, paper sizes, orientations, margins and footer space.
- 11 focused Chromium checks passed across image PDF, existing file-order and result-handoff suites; a subsequent three-case image suite also checks embedded JPEG data for filter output.
- All 51 Pages browser checks passed after preserving the default image-sized physical dimensions. The three image checks passed against the `/ihatepdf/` Pages build: order and per-image edits, PDF dimensions/title/page numbers, crop rejection/recovery, duplication/reset/apply-all, download recovery, settings invalidation and narrow-screen overflow.
- Manual browser check with three synthetic photos: moved the third image into the second position, applied grayscale only to it, selected Letter with 12 mm margins and numbering, and prepared `ihatepdf-manual-check.pdf` (87.8 KB). Recovery link and next-tool choices appeared; no console warnings/errors were captured.

These are scoped synthetic checks, not a guarantee for every image, browser or physical device. Deployment confirmation is separate from the local verification recorded here.
