# FolioCove capabilities

FolioCove is a browser PDF workspace. Release status: private-beta. Operator name supplied: FolioCove, India. A public support email has not yet been set up.

## Processing and privacy

Selected documents are processed on-device; there is no document-upload endpoint. The host serves assets and controls access. OCR and browser AI can download models. Local processing does not mean zero network traffic. The beta limit is 100 MB per file; device memory can impose lower limits.

## Unavailable

- Verified secure sanitization
- Validated PDF/A conversion
- Remote signature requests
- Automatic form detection
- Layout-preserving translation

## Tools

### Merge PDFs

- ID: merge
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/merge-pdf/
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Combine multiple PDFs in the order you add them.
- Boundary: Combine multiple PDFs in the order you add them.

### Extract pages

- ID: split
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/split-pdf/
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Create a new PDF from only the pages you need.
- Boundary: Create a new PDF from only the pages you need.

### Rotate PDF

- ID: rotate
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=rotate
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Rotate every page clockwise while keeping quality intact.
- Boundary: Rotate every page clockwise while keeping quality intact.

### Images to PDF

- ID: images
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=images
- Status: implemented
- Input MIME types: image/jpeg, image/png
- Purpose: Turn JPG and PNG images into one clean PDF.
- Boundary: Turn JPG and PNG images into one clean PDF.

### Add watermark

- ID: watermark
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=watermark
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Stamp custom text across every page without uploading.
- Boundary: Stamp custom text across every page without uploading.

### Add page numbers

- ID: numbers
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=numbers
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Add clean, centered numbering to every page.
- Boundary: Add clean, centered numbering to every page.

### Clear PDF info fields

- ID: clean
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=clean
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Clear standard title, author, subject, keyword and software fields only. Hidden data is not removed.
- Boundary: Clear standard title, author, subject, keyword and software fields only. Hidden data is not removed.

### Inspect PDF

- ID: inspect
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=inspect
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Check page count, dimensions and hidden document details.
- Boundary: Check page count, dimensions and hidden document details.

### Quick Action

- ID: quick
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=quick
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Describe several changes once. FolioCove runs them locally in one pass.
- Boundary: Describe several changes once. FolioCove runs them locally in one pass.

### Organize pages

- ID: organize
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=organize
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Reorder, remove or duplicate pages with one simple sequence.
- Boundary: Reorder, remove or duplicate pages with one simple sequence.

### Crop margins

- ID: crop
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=crop
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Trim whitespace from every page by a precise percentage.
- Boundary: Trim whitespace from every page by a precise percentage.

### Flatten forms

- ID: flatten
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=flatten
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Lock filled form values into the PDF for reliable sharing.
- Boundary: Lock filled form values into the PDF for reliable sharing.

### PDF page to PNG

- ID: topng
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=topng
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Export any PDF page as a crisp, high-resolution PNG.
- Boundary: Export any PDF page as a crisp, high-resolution PNG.

### Edit metadata

- ID: metadata
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=metadata
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Set the title, author and subject stored inside your PDF.
- Boundary: Set the title, author and subject stored inside your PDF.

### Header & footer

- ID: header
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=header
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Add consistent document labels across every page.
- Boundary: Add consistent document labels across every page.

### Reverse page order

- ID: reverse
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=reverse
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Flip the entire document from last page to first.
- Boundary: Flip the entire document from last page to first.

### Odd / even pages

- ID: oddeven
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=oddeven
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Create a new PDF containing only odd or even pages.
- Boundary: Create a new PDF containing only odd or even pages.

### Interleave PDFs

- ID: interleave
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=interleave
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Alternate pages from two PDFs—perfect for front/back scans.
- Boundary: Alternate pages from two PDFs—perfect for front/back scans.

### Resize pages

- ID: resize
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=resize
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Fit every page cleanly onto A4 or US Letter paper.
- Boundary: Fit every page cleanly onto A4 or US Letter paper.

### Two-up layout

- ID: twoup
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=twoup
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Place two document pages side by side on each sheet.
- Boundary: Place two document pages side by side on each sheet.

### Bates numbering

- ID: bates
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=bates
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Add a prefixed, zero-padded identifier to every page.
- Boundary: Add a prefixed, zero-padded identifier to every page.

### Compress PDF

- ID: compress
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=compress
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Shrink a PDF locally by rebuilding pages at a chosen quality.
- Boundary: Pages become images. Text selection, forms and accessibility information are lost.

### All pages to PNG

- ID: allpng
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=allpng
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Export every PDF page into one convenient ZIP file.
- Boundary: Export every PDF page into one convenient ZIP file.

### Split into chunks

- ID: chunk
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=chunk
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Break a long PDF into smaller PDFs inside one ZIP.
- Boundary: Break a long PDF into smaller PDFs inside one ZIP.

### Insert blank page

- ID: blank
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=blank
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Add a blank A4 page at the end of your document.
- Boundary: Add a blank A4 page at the end of your document.

### Extract text

- ID: text
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=text
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Save selectable PDF text as a clean TXT file.
- Boundary: Save selectable PDF text as a clean TXT file.

### PDF to Markdown

- ID: markdown
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=markdown
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Turn selectable PDF text into page-structured Markdown.
- Boundary: Turn selectable PDF text into page-structured Markdown.

### Reading statistics

- ID: stats
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=stats
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Count words, characters and estimated reading time locally.
- Boundary: Count words, characters and estimated reading time locally.

### Date stamp

- ID: datestamp
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=datestamp
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Add today’s date to the bottom of every PDF page.
- Boundary: Add today’s date to the bottom of every PDF page.

### Remove annotations

- ID: annotations
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=annotations
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Remove comments, links and interactive annotations from every page.
- Boundary: Remove comments, links and interactive annotations from every page.

### Add print margins

- ID: margins
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=margins
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Place each page on a larger white canvas for safer printing.
- Boundary: Place each page on a larger white canvas for safer printing.

### Grayscale PDF

- ID: grayscale
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=grayscale
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Create a black-and-white friendly copy for printing and archiving.
- Boundary: Create a black-and-white friendly copy for printing and archiving.

### Find text

- ID: findtext
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=findtext
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Find every page containing a word or phrase without uploading.
- Boundary: Find every page containing a word or phrase without uploading.

### Compare PDFs

- ID: compare
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=compare
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Compare page text from two PDFs and identify changed pages.
- Boundary: Compare page text from two PDFs and identify changed pages.

### File fingerprint

- ID: checksum
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=checksum
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Generate a SHA-256 fingerprint to verify document integrity.
- Boundary: Generate a SHA-256 fingerprint to verify document integrity.

### PDF to JSON

- ID: tojson
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=tojson
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Export page-by-page text as structured JSON for automation.
- Boundary: Export page-by-page text as structured JSON for automation.

### Remove blank pages

- ID: removeblank
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=removeblank
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Visually detect and remove empty pages from a PDF.
- Boundary: Visually detect and remove empty pages from a PDF.

### OCR scanned PDF

- ID: ocr
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=ocr
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Recognize English text from scanned pages and download it as TXT.
- Boundary: English OCR only. Results can contain recognition errors. Large scans can exhaust browser memory.

### Enhance scanned PDF

- ID: contrast
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=contrast
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Increase grayscale contrast for clearer printing and reading.
- Boundary: Increase grayscale contrast for clearer printing and reading.

### Remove headers & footers

- ID: trimheads
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=trimheads
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Cover the outer header and footer bands on every page.
- Boundary: Covers regions with white rectangles; underlying text remains recoverable. This is NOT redaction.

### Split scanned spreads

- ID: spreads
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=spreads
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Turn each landscape two-page scan into separate left and right pages.
- Boundary: Turn each landscape two-page scan into separate left and right pages.

### Edit PDF

- ID: edit
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/edit-pdf/
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Place new text precisely on any page.
- Boundary: Adds text overlays only; it does not edit existing PDF text. Standard fonts have limited language support.

### Sign PDF

- ID: sign
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/sign-pdf/
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Add a typed signature and date to any page.
- Boundary: Adds a typed visual mark only. No cryptographic signature, identity verification, signature requests or audit trail.

### Secure redact

- ID: redact
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/redact-pdf/
- Status: experimental
- Input MIME types: application/pdf
- Purpose: Permanently rasterize and black out a selected page region.
- Boundary: Experimental raster redaction. The requested page and region are validated before output; verify the downloaded result independently before sharing sensitive material.

### Fill PDF forms

- ID: fillform
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=fillform
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Fill named text, checkbox and choice fields from one simple list.
- Boundary: Fill named text, checkbox and choice fields from one simple list.

### Searchable OCR PDF

- ID: searchableocr
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/ocr-pdf/
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Create a searchable scanned PDF with an invisible English text layer.
- Boundary: English OCR only. Invisible text is not precisely aligned with the scan. Check recognition accuracy; OCR language models may need internet to load.

### Repair PDF

- ID: repair
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=repair
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Rebuild readable objects and save a clean PDF copy.
- Boundary: Resaves PDFs the parser can already read. Severely corrupted or encrypted PDFs may fail.

### Smart summary

- ID: summary
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=summary
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Create a private extractive summary without sending text to an AI server.
- Boundary: Extractive sentence ranking, not an AI-written summary.

### Translate PDF text

- ID: translate
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=translate
- Status: browser-dependent
- Input MIME types: application/pdf
- Purpose: Translate extracted text with your browser’s on-device translation engine when available.
- Boundary: Requires the browser Translator API and supported language models; not available in every browser. English source text only; TXT output.

### HTML to PDF

- ID: htmltopdf
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=htmltopdf
- Status: implemented
- Input MIME types: text/html, text/plain
- Purpose: Convert an HTML or text document into a clean, printable PDF.
- Boundary: Extracts local HTML text only; no webpage URL fetching, CSS layout or embedded images.

### Word to PDF

- ID: wordtopdf
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=wordtopdf
- Status: implemented
- Input MIME types: application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Purpose: Convert DOCX text into a private browser-generated PDF.
- Boundary: DOCX text extraction only; layout, images and tables are not preserved.

### Excel to PDF

- ID: exceltopdf
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=exceltopdf
- Status: implemented
- Input MIME types: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel
- Purpose: Render spreadsheet cell values into paginated PDF tables.
- Boundary: Exports spreadsheet cell values as text. Formatting, charts and formula layout are not preserved.

### PowerPoint to PDF

- ID: ppttopdf
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=ppttopdf
- Status: implemented
- Input MIME types: application/vnd.openxmlformats-officedocument.presentationml.presentation
- Purpose: Extract slide text and create one clean PDF page per slide.
- Boundary: Exports slide text only; visual slide layout and graphics are not preserved.

### PDF to Word

- ID: pdftoword
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=pdftoword
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Export selectable PDF text as an editable Word-compatible document.
- Boundary: Exports text as HTML in a .doc wrapper, not a native DOCX conversion. Word may show a format warning.

### PDF to Excel

- ID: pdftoexcel
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=pdftoexcel
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Export page text into an editable spreadsheet with one row per line.
- Boundary: Exports text to CSV, not native XLSX or accurate table reconstruction. Spreadsheet-triggering values are prefixed as text.

### Duplicate pages

- ID: duplicate
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=duplicate
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Repeat selected pages immediately after their originals.
- Boundary: Repeat selected pages immediately after their originals.

### Delete pages

- ID: deletepages
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=deletepages
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Remove selected pages and keep everything else.
- Boundary: Remove selected pages and keep everything else.

### Split every N pages

- ID: splitcustom
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=splitcustom
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Create a ZIP containing consistently sized PDF chunks.
- Boundary: Create a ZIP containing consistently sized PDF chunks.

### Booklet layout

- ID: booklet
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=booklet
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Impose pages for double-sided folding and saddle-stitch printing.
- Boundary: Impose pages for double-sided folding and saddle-stitch printing.

### Four-up handout

- ID: fourup
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=fourup
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Place four document pages on each landscape sheet.
- Boundary: Place four document pages on each landscape sheet.

### Approval stamp

- ID: stamp
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=stamp
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Add a dated approval, review or draft stamp to every page.
- Boundary: Add a dated approval, review or draft stamp to every page.

### QR code stamp

- ID: qrstamp
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=qrstamp
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Place a scannable URL or reference code onto every page.
- Boundary: Place a scannable URL or reference code onto every page.

### Sanitization unavailable

- ID: sanitize
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=sanitize
- Status: unavailable
- Input MIME types: application/pdf
- Purpose: Verified hidden-data removal is paused until output cleanup can be independently proven.
- Boundary: Verified secure sanitization is currently unavailable. This tool will not create a PDF download.

### Extract contacts

- ID: contacts
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=contacts
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Find email addresses, phone numbers and web links in selectable text.
- Boundary: Find email addresses, phone numbers and web links in selectable text.

### Deskew scans

- ID: deskew
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=deskew
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Correct a consistent small tilt across scanned pages.
- Boundary: Correct a consistent small tilt across scanned pages.

### Visual page organizer

- ID: visualorganize
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/organize-pdf/
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Drag thumbnail pages into order, rotate them or remove them.
- Boundary: Use thumbnail buttons to move, rotate or remove pages. Keep at least one page.

### Compress to target size

- ID: targetcompress
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/compress-pdf/
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Aim for a specific upload limit with automatic quality selection.
- Boundary: Lossy conversion: pages become images, selectable text and forms are lost, and the target size is not guaranteed. Check readability before uploading.

### Camera document scanner

- ID: camerascanner
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/scan-pdf/
- Status: implemented
- Input MIME types: image/jpeg, image/png, image/webp
- Purpose: Capture or select document photos, trim white borders and enhance contrast.
- Boundary: Photo capture depends on your device. Trims near-white borders; does not correct perspective or detect document corners.

### Privacy Inspector

- ID: privacycheck
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/privacy-inspector/
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Inspect hidden-data signals before sharing. No sanitized copy is created.
- Boundary: Limited structural inspection, not a security audit. Sanitized sharing downloads are disabled until hidden-data removal can be independently verified.

### Workflow builder

- ID: workflow
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=workflow
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Combine repeatable document actions and save the recipe on this device.
- Boundary: Saves one recipe locally on this browser. Grayscale rasterizes pages and removes searchable text.

### Sensitive data finder

- ID: sensitive
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=sensitive
- Status: experimental
- Input MIME types: application/pdf
- Purpose: Find common personal-data patterns and permanently redact confirmed matches.
- Boundary: Experimental pattern matching, not complete personal-data detection. False positives and missed matches are possible. Review each result independently.

### Document quality check

- ID: qualitycheck
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=qualitycheck
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Detect mixed page sizes, blank pages, low text coverage and scan-quality problems.
- Boundary: Heuristic checks for blank pages, contrast and text coverage; not an accessibility or print-compliance audit.

### Ask PDF locally

- ID: askpdf
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=askpdf
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Find the most relevant passages for a question without uploading document text.
- Boundary: Keyword passage retrieval, not AI reasoning or a generated answer. Results may be irrelevant.

### OpenDocument / EPUB to PDF

- ID: opendoc
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=opendoc
- Status: experimental
- Input MIME types: application/epub+zip, application/rtf, text/rtf, application/vnd.oasis.opendocument.text, application/vnd.oasis.opendocument.spreadsheet, application/vnd.oasis.opendocument.presentation
- Purpose: Convert ODT, ODS, ODP, EPUB and RTF text into a clean PDF.
- Boundary: Text-only experimental conversion. Layout and ebook reading order may not be preserved.

### Protect PDF

- ID: protect
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=protect
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Encrypt a PDF with an AES-256 password on this device.
- Boundary: Encrypt a PDF with an AES-256 password on this device.

### Unlock PDF

- ID: unlock
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=unlock
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Remove encryption using the document password.
- Boundary: Remove encryption using the document password.

### Lossless PDF compression

- ID: lossless
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=lossless
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Optimize PDF structure without rasterizing text. Size reduction varies.
- Boundary: Optimize PDF structure without rasterizing text. Size reduction varies.

### Recover damaged PDF

- ID: recover
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=recover
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Attempt local cross-reference and object recovery. Some damaged files cannot be recovered.
- Boundary: Attempt local cross-reference and object recovery. Some damaged files cannot be recovered.

### PDF to JPG

- ID: jpg
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=jpg
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Export each page as a JPG in a ZIP file.
- Boundary: Export each page as a JPG in a ZIP file.

### PDF to Word (DOCX)

- ID: docx
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=docx
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Export selectable text into an editable DOCX. Original layouts and images are not preserved.
- Boundary: Export selectable text into an editable DOCX. Original layouts and images are not preserved.

### PDF to Excel (XLSX)

- ID: xlsx
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=xlsx
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Export extracted text rows into a real workbook, one sheet per page. Table reconstruction is approximate.
- Boundary: Export extracted text rows into a real workbook, one sheet per page. Table reconstruction is approximate.

### PDF to PowerPoint

- ID: pptx
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=pptx
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Preserve each page visually as a slide image. Slide content is not editable.
- Boundary: Preserve each page visually as a slide image. Slide content is not editable.

### Create PDF forms

- ID: createform
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=createform
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Add a named text field, checkbox, dropdown, or radio group to a PDF. Existing form fields are preserved.
- Boundary: Add a named text field, checkbox, dropdown, or radio group to a PDF. Existing form fields are preserved.

### Draw signature / freehand

- ID: drawsign
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=drawsign
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Draw an ink signature or annotation and place it on a page. This is a visual mark, not a digital certificate.
- Boundary: Draw an ink signature or annotation and place it on a page. This is a visual mark, not a digital certificate.

### Image watermark

- ID: imagewatermark
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=imagewatermark
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Place a PNG or JPG watermark on every PDF page.
- Boundary: Place a PNG or JPG watermark on every PDF page.

### Add PDF shapes

- ID: shapes
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=shapes
- Status: implemented
- Input MIME types: application/pdf
- Purpose: Add a colored rectangle, ellipse, or line to a page.
- Boundary: Add a colored rectangle, ellipse, or line to a page.

### Compare PDFs visually

- ID: visualcompare
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=visualcompare
- Status: implemented
- Input MIME types: application/pdf
- Purpose: View corresponding pages side by side locally. This does not automatically identify every difference.
- Boundary: View corresponding pages side by side locally. This does not automatically identify every difference.

### AI Summarizer

- ID: aisummary
- Open: https://foliocove-tools.mehbulislam81.chatgpt.site/?tool=aisummary
- Status: browser-dependent
- Input MIME types: application/pdf
- Purpose: Summarize selectable text using the browser’s on-device AI, when supported. A model download may be required.
- Boundary: Browser-dependent on-device AI. Requires a supported browser and available English model; a model download may be needed. If unavailable, use Smart summary instead.

## Validation boundary

A focused audit on 2026-10-02 tested representative synthetic inputs. The subsequent 21-check engine/emulation pilot passed. Physical phone cameras, native downloads and actual Safari remain unverified. Output parseability does not prove accuracy for every document.
