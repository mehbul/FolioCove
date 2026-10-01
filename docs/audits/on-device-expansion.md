# On-device PDF catalog expansion

The owner explicitly chose on-device document processing. No server conversion, AI API, document upload, or signature-request service was added.

Added 14 working catalog entries: AES-256 protection, password-based unlocking, lossless compression, qpdf recovery, JPG page ZIP, native text DOCX, native text-row XLSX, image-slide PPTX, manual interactive form creation, drawn signatures/freehand ink, image watermarks, shapes, visual comparison, and browser-dependent AI summarization. Existing text editing now offers three standard fonts, size, and color. Conversion and intelligence categories and 25 additional homepage cards make the wider catalog discoverable.

## Verification

- Build and 77 generated-bundle handler regressions passed.
- Nine focused Chromium workflows passed: protection/wrong-password/unlocking, form fields/shapes, comparison/unsupported AI, lossless compression/recovery, drawn signature/image watermark, DOCX, XLSX, PPTX, and JPG signatures.
- Ten direct core routes passed. Existing core workflows also passed during integration; editing/signing were rechecked after adding typography controls.
- npm install reported zero known vulnerabilities after pinning patched image-size 2.0.3. Browser PptxGenJS does not execute its Node image-size integration; the override removes the vulnerable dependency from the tree as well.
- Tests use synthetic PDFs. Recovery was checked on a readable PDF, not a representative corpus of damaged files. AI success depends on a browser exposing Summarizer and was not exercised in Chromium; its unsupported path was checked.

## Requested features with remaining limits

| Requested capability | Current local boundary |
| --- | --- |
| Office conversion | DOCX text, spreadsheet values, PPTX text input; native text DOCX/XLSX output and image-slide PPTX output. Legacy DOC/PPT input and faithful editable layout conversion remain unavailable. |
| PDF to JPG | Page rendering; extracting every original embedded image is not implemented. |
| Edit PDF | Text overlays with typography, shapes, drawn ink, and image watermarks. Existing PDF text cannot be rewritten. |
| Sign PDF | Typed/drawn visual signatures. Remote requests, identity verification, and certificates are unavailable. |
| HTML to PDF | Local HTML/text conversion. Remote URLs are not fetched. |
| PDF/A | Validated archival conversion is unavailable. Ordinary PDFs are not relabeled as compliant. |
| Repair | Best-effort qpdf structural recovery; missing content cannot be recreated. |
| Scan to PDF | Local camera/file import. Cross-device phone-to-browser transfer is unavailable. |
| OCR | English recognition; review accuracy and text placement. |
| Compare | Text comparison and corresponding visual page previews, not exhaustive graphical difference detection. |
| Forms | Manual text, checkbox, dropdown, and radio creation; filling existing fields. Automatic field detection is unavailable. |
| AI summary | Local browser Summarizer API, English, supported browsers only. Smart summary remains an extractive fallback selected separately. |
| Translation | Local browser Translator API; English source and translated TXT output, not preserved PDF layout. |
| Markdown | Page-structured text output; full semantic reconstruction of tables, headings, and links is unavailable. |

The limitations page exposes these boundaries. Site access remains owner-private. This release is an expansion, not full iLovePDF parity.
