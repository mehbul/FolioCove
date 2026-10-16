# Conversion task discovery and demonstration correction

Scope: four existing handlers receive dedicated routes; a conversion chooser connects supported output formats. No new conversion engines, uploads, analytics or paid services are introduced. The private Sites audience is preserved.

## Research

Inspected the official iLovePDF PDF-to-Word and Word-to-PDF pages, Smallpdf PDF-to-Word and Adobe PDF-to-Word pages. Common observed patterns were task-specific URLs/headings, immediate file selection, related conversion links, instructions and format-specific help. These observations do not establish why any brand ranks. No search volumes, authority scores or ranking improvements were measured.

Sources:
- https://www.ilovepdf.com/pdf_to_word
- https://www.ilovepdf.com/word_to_pdf
- https://smallpdf.com/pdf-to-word
- https://www.adobe.com/acrobat/online/pdf-to-word.html

The providers advertise richer fidelity than FolioCove's current text-oriented Office conversion. FolioCove must not copy their accuracy, editable-layout, usage-count, certification or universal-device claims.

## Implemented

- `/pdf-to-excel/`: native XLSX text export, one worksheet per page; approximate columns, no recovery of original tables/formulas.
- `/excel-to-pdf/`: XLSX/XLS cell-value export; no original styling, charts or formula layout.
- `/pdf-to-powerpoint/`: PDF pages rendered as images in a native PPTX; not editable slide objects.
- `/powerpoint-to-pdf/`: PPTX text to PDF; original design, graphics and legacy PPT unsupported.
- `/pdf-converter/`: a decision page linking eight dedicated conversions and the existing Markdown catalog tool. It explains scans, appearance, output expectations and network boundaries rather than repeating a page per keyword variant.

Registry-driven capabilities, sitemap, homepage links, task instructions and direct-route selection include the new routes. Each task has its own title, description, canonical URL, initial HTML guidance and truthful limitations. The total is 19 task routes and 39 public HTML sitemap entries.

## Video correction

The first extraction video started after selection, used a distant viewport, lacked a visual output preview and had captions beyond its 14.32-second duration. The replacement is approximately 20.24 seconds, cropped to the actual workspace, starting with an empty selection and ending with a clearly labeled verification view rendered from the actual downloaded PDF. The download was verified to contain exactly pages 2, 3 and 4 in order. The verification view is not presented as a feature of the application.

The poster, H.264 MP4, VP8 WebM and captions are versioned. MP4 is first, WebM remains a fallback, playsinline is enabled and a direct MP4 download is available. Caption cues come from recorded action times. Previous direct media URLs are retained as aliases to the corrected recording. Actual Safari-app playback has not been established.

## Validation

The new route regression check first failed on the absent route, then passed with real native XLSX/PPTX downloads and reverse-direction text PDF checks. It checks two worksheets, two image slides, source text markers, no page errors and no external requests in the tested conversion flows. All 21 Pages browser checks passed locally, including all 19 task pages without JavaScript, metadata consistency and mobile-width checks. The video check covers MP4 playback, asset availability, poster and caption end times within media duration.

Required root build, handler and AI-readiness checks run before commit; deployment completion and live verification are recorded separately. Indexing, rankings, user acquisition and AI citation are not established by this work. Existing accepted indexing/sitemap requests must not be resubmitted repeatedly.
