# Continue with a prepared PDF

The owner requested implementation of the next workflow improvement: reuse a generated PDF in another tool without downloading and selecting it again.

## Implemented scope

Eligible PDF results offer page organization, page extraction and lossless compression, excluding the tool that just ran. Handoff creates a File from the existing in-memory result, selects the destination through the ordinary workspace API and adds it through the existing file-selection path. No request, upload, document storage or automatic processing is introduced.

Destination settings reset through normal tool selection. The heading receives keyboard focus and the status asks the user to review limits before processing. The previous result and its object URL are cleared; original files on the user's device are unaffected. Result controls are disabled while a processing job owns the selection. Input, tool or option changes clear stale handoff state.

Non-PDF downloads, encrypted output from Protect PDF and results exceeding the existing 100 MB per-file beta limit retain ordinary download recovery without these choices. The app does not claim every arbitrary PDF will work, lossless compression will reduce size, or rewritten digital signatures remain valid. Existing beta, fidelity and browser limits remain in place.

## Verification

- The new chain test failed against the previous build because no next-tool control existed.
- Five focused Chromium checks passed: merge → remove a page in the organizer → lossless compression; mobile keyboard handoff into extraction; DOCX output exclusion; active-job locking and stale-input cleanup; protected-output exclusion.
- The chain verifies actual labeled PDF pages and their order, not just completion messages. The previous result URL becomes unusable after handoff. Network guards detect document-marker transmission and block external processing requests.
- Build, 77 generated-bundle handler cases and AI-readiness checks passed.
- All 33 Pages browser checks passed at `/FolioCove/`, including the five new cases.
- All 30 short pilot checks passed across Android Chromium emulation, iPhone WebKit emulation and desktop WebKit. The six added checks exercise the full handoff chain and keyboard extraction in each engine profile.
- Desktop and 390px screenshots were inspected; result controls wrap without horizontal overflow. This does not establish a complete screen-reader or accessibility audit.
- The ordinary root build was restored before staging generated files.

Release success requires this commit's completed hosted CI/Pages workflows and a live handoff check. Engine/emulation tests do not establish physical phone capture, native phone download/opening or Apple's Safari-app behavior. Those existing device gates and the full 100-case fixture plan remain separate.
