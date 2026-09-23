# M09 validation report

Date: 2026-09-23

Branch: `codex/validation-m09`

Case: M09 only

Result: PASS in bundled Chromium. A valid one-page PDF followed by a truncated `%PDF` file produced a visible error and no partial `merged.pdf` download. The original valid file remained available, and the controls recovered so the bad file could be removed and replaced.

## Fixture and oracle

The first PDF is generated with `pdf-lib` and contains a unique selectable-text marker. The second input begins with `%PDF-1.7` but has no usable document structure. The test confirms that `pdf-lib` can load the valid PDF and that traversing pages in the malformed one throws. Both files are selected before the merge button is clicked, so the malformed input reaches the processing path instead of an input-count guard.

Privacy guards are installed before navigation and watch for both filenames and marker text in outbound traffic. A page-lifetime download listener records every download event. The browser test requires an error status with recovery guidance, one started and one failed local metric with zero completions, an enabled run button, hidden job controls, and no inert file or option regions. It observes downloads for another 1.5 seconds after the error and requires none. Both selected rows remain in order. Removing the malformed row leaves the original valid PDF listed; adding a valid replacement enables the merge action again. The test does not run the replacement merge, which is covered by M01.

## Commands and result

- `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --grep=M09 --reporter=list` — PASS, 1/1.
- `npm run build` — PASS; generated 10 tool routes and 5 beta information pages.
- `npm test` — PASS; 77 generated-bundle handler executions.
- `git diff --check` — PASS.

Environment: Node 24, Playwright 1.63.0 (bundled Chromium).

## Coverage limit

This checks one malformed input and the visible recovery path in Chromium. It does not classify every possible PDF corruption pattern or verify recovery in other browsers.
