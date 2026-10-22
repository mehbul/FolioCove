# Conversion and mobile readiness — 22 October 2026

## Verified scope

The existing root build passed the following on Windows. No application implementation change was required by these checks.

| Run | Result | Scope |
| --- | --- | --- |
| `npx playwright test tests/e2e/conversion-appearance.spec.mjs tests/e2e/office-layout.spec.mjs --project=chromium --reporter=list` | 13 passed, 16.3 seconds | Representative synthetic Word, Excel, PowerPoint and HTML conversion fixtures, page dimensions, external-resource rejection and missing formula-cache errors. |
| `npx playwright test --config=playwright.pilot.config.mjs` | 51 passed, 56.8 seconds | 17 each in Pixel 7 Chromium emulation, iPhone 13 WebKit emulation and desktop WebKit. |

Word checks exercise a two-page PDF-to-DOCX-to-PDF appearance round trip with image-difference and page-dimension assertions, plus colored text, table shading, header/footer and explicit page breaks in a synthetic DOCX. Excel checks exercise merged cells, column widths, colored fonts/fills, embedded-image anchors, hidden sheets and formula-cache error handling. PowerPoint checks exercise slide dimensions, backgrounds, shapes, positioned text, hidden slides and image round trips. External Word image links and external HTML CSS are rejected without fetching or producing a partial PDF. The pilot also exercises synthetic photo import, merge/split downloads, typed signatures, local AI unavailability, picker cancellation/empty selection, bad photos, visible limits and PDF result handoff.

The rendered first-page PNGs for the styled DOCX, spreadsheet and presentation were visually inspected. The synthetic DOCX shows its header/footer, red heading and blue table cell; the spreadsheet shows the red heading and blue fill with distinct columns; the presentation shows its blue background, red shape and positioned white title. This is a spot check of these fixtures, not a claim of Microsoft Office layout equivalence.

## Fidelity boundaries remain visible

Appearance outputs use page images and are not editable/selectable text. Optional text modes remove or approximate layout. Complex fonts, pagination, Office charts, SmartArt, grouped objects, conditional formatting and some print settings remain unsupported or may differ. No formula calculation engine, legacy DOC/PPT renderer or exact editable PDF-to-Office reconstruction is claimed. Keep originals and inspect output before relying on it.

## Physical-device gate remains open

The available Windows environment has Playwright engines and device emulation. No `adb` or `idevice_id` command was available in PATH, and no physical-phone session was provided. The checks above cannot prove camera permission prompts/capture, native phone file pickers, Files/Downloads opening, return from camera or Apple's Safari application behavior. The existing `src/static/device-pilot.csv` remains pending for Android, iPhone Safari and macOS Safari; no rows were marked complete.

A five-minute check on each actual device is sufficient for this beta; no 100-case plan is needed:

1. Open https://mehbul.github.io/ihatepdf/scan-pdf/ in Android Chrome or iPhone Safari. Photograph a synthetic page with an obvious TOP label and four corner marks. Check that camera capture is offered, cancel once safely, then capture and return to a responsive workspace.
2. Create the scan PDF, save it through the native browser controls, and open it from Files/Downloads. Verify readable content, complete corners and correct orientation.
3. Open https://mehbul.github.io/ihatepdf/merge-pdf/, use the bundled synthetic sample PDFs, merge, save and open the result. Verify three pages in the order FC-MERGE-A-1, FC-MERGE-B-1, FC-MERGE-B-2. Repeat a download once.
4. Confirm the feature-limit notice is readable before processing and controls remain usable in portrait and landscape. On macOS Safari, perform the merge/save/open and picker-cancel steps in the actual Safari app.
5. Record device model, OS/browser versions and observed outcomes in the existing CSV. Use only synthetic files; report an issue without attaching personal documents. A failed capture/download blocks claims of support for that device until fixed and rechecked.

The PRODUCT.md brand paragraph was corrected to record the 22 October repository/Pages migration; historical audit URLs are not rewritten as current evidence.
