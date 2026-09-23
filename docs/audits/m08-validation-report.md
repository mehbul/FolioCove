# M08 validation report

Date: 2026-09-23

Branch: `codex/validation-m08`

Case: M08 only

Result: PASS in bundled Chromium. With one valid PDF selected, Merge & download stayed disabled and produced no processing metric, status change, or download. Adding a second PDF enabled the action.

## Fixture and oracle

Two one-page PDFs with unique selectable-text markers are generated at runtime with `pdf-lib`. Privacy guards are installed before navigation and watch for either fixture filename or marker in outbound traffic. The test verifies the private-beta notice, PDF-only input, and `noindex,nofollow` metadata.

The test opts into local metrics through initial browser storage before navigation and verifies the opt-in checkbox and zero-count summary. After selecting only the first PDF, it confirms one file row and a disabled run button, then makes a real pointer click at that button's center. After a 1.5-second observation window, the status is empty, job controls are hidden, interactive regions remain idle, the stored metrics array is empty, output byte count is zero, and no download event occurred. The JSON evidence records the observation duration. Selecting the second PDF separately must leave exactly two rows in order and enable the run button. The test does not start a merge after that point; M01 covers successful execution.

## Commands and result

- `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --grep=M08 --reporter=list` — PASS, 1/1.
- `npm run build` — PASS; generated 10 tool routes and 5 beta information pages.
- `npm test` — PASS; 77 generated-bundle handler executions.
- `git diff --check` — PASS.

Environment: Node v24.15.0, npm 11.12.1, Playwright 1.63.0 (bundled Chromium).

## Coverage limit

This checks the disabled control and its effect during a short browser observation window. It does not prove that a forged script event could never invoke processing, or that every possible alternate input path obeys the same guard.
