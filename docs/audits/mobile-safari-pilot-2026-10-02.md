# Short mobile and Safari-engine pilot — 2 October 2026

## Verified here

21 checks passed: seven each on Android/Chromium emulation, iPhone/WebKit emulation, and desktop WebKit (26.6). This is Windows-hosted Playwright, not physical Android, iOS or Apple's Safari application.

The checks covered merge/split downloads with expected page counts, synthetic document-photo import and scan-PDF download, editable text/typed-signature outputs, unavailable local AI producing no download, rear-camera capture input configuration, empty selection leaving processing disabled, unreadable photos failing without a download, and visible feature warnings. Saved PDF outputs were independently parsed; this does not establish native phone download/open behavior.

## Feature-limit visibility

- AI summary and translation have browser-dependent badges, a general catalog/route notice and workspace warnings before Run.
- Redaction has an Experimental badge and pre-processing warning; independent review is still required.
- Verified sanitization and PDF/A are explicitly unavailable in the catalog/route notice and limitations page. Sanitization remains fail-closed.
- The workspace limit notice is before the Run button; notices do not overflow at 390 or 1440 px.

## Physical-device checks still pending

No physical phone or macOS Safari is connected to this session. No actual camera capture, camera permission, native file picker, Files/Downloads integration or human task completion was performed. Do not mark these passed on the strength of emulation.

### Five-minute owner pilot

Use a synthetic page reading FOLIOCOVE PHONE TEST; avoid personal documents. On each available phone:

1. Open the private FolioCove site in Android Chrome or iPhone Safari and sign in using your existing owner access.
2. Open Scan photos. Choose files and take a rear-camera photo if the native picker offers it. Confirm the selected photo appears. If capture is not offered, record that fact and try importing a JPG/PNG instead. HEIC/HEIF is not a supported import format.
3. Choose Create scanned PDF. Save the result using the browser's download/share flow. Open it in the native Files/Downloads viewer and confirm the photographed page is visible and correctly oriented.
4. Return to Scan photos and dismiss the native picker. Confirm it does not start a job or create a download. Check whether returning from the camera leaves the page responsive.
5. Open Merge PDFs, select two synthetic PDFs and download/open the result. Confirm both pages and their order. Check that experimental/browser-dependent limitations are visible before processing.

For macOS Safari, repeat photo import and merge/download/open; a rear-camera capture test is not required for desktop.

Record device model, OS/browser version, camera offered/captured, selected file type, scan saved/opened, page orientation, merge saved/opened, cancellation behavior, and pass/failure. Report only these observations and the tool/error category; do not send documents or credentials.

## Repeat automated checks

Use playwright.pilot.config.mjs. Install Playwright WebKit in a local cache and set FOLIOCOVE_WEBKIT_EXECUTABLE to its executable path when it is not installed in Playwright's default location. Run npx playwright test --config=playwright.pilot.config.mjs. The workspace-local browser is ignored by Git.

## Verdict

Automated pilot passed. Physical phone and native Safari pilot remains pending. Support inbox and final public notices also remain pending; public access has not been enabled.
