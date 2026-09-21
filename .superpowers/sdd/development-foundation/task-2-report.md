# Task 2 report: real-browser validation of the ten core tools

## Architecture and test changes

- Added pinned Playwright browser validation with `@playwright/test` 1.63.0 and `playwright.config.mjs`.
- Playwright serves the built `dist/` application through `npm run dev` at `http://127.0.0.1:4173`, so E2E coverage exercises the generated deployable site rather than source-only handlers.
- Added npm scripts:
  - `npm run test:e2e` for Playwright-managed Chromium.
  - `npm run test:e2e:installed` for installed desktop Chrome and Edge projects.
  - `npm run test:e2e:ocr` for the network-dependent OCR smoke test with `PRIVYPDF_RUN_OCR=1`.
- Configured traces and screenshots only on failure, and ignored Playwright artifacts in `.gitignore`.
- Updated CI to install Playwright Chromium, build, run generated-bundle tests, and run the Chromium browser E2E subset.
- Added stable selectors only where the browser tests needed non-layout anchors: tool title, file input, options, visual panel, run button, status, tool limit notice, and organizer page thumbnails.
- Added deterministic synthetic browser fixtures in `tests/e2e/helpers.mjs`: generated PDFs, malformed PDF bytes, generated PNG document photo, metadata fixtures, and a unique marker/filename used for privacy assertions.
- Added route coverage in `tests/e2e/routes.spec.mjs` for all ten dedicated routes: merge, split, organize, compress, scan, OCR, edit, sign, redact, and Privacy Inspector.
- Added workflow coverage in `tests/e2e/core-workflows.spec.mjs` for merge, split, visual organize, target compress, camera/photo-to-PDF, edit, typed sign, redact, Privacy Inspector, unsupported TXT input, and malformed PDF input.
- Added `tests/e2e/ocr.local.spec.mjs` as a local-only OCR E2E smoke test. It is skipped unless `PRIVYPDF_RUN_OCR=1`, because English model data may require external deterministic access.
- Updated `README.md` and `TEST_RESULTS.md` with exact browser coverage, local-only commands, CI behavior, and gaps.

## Tools and browsers actually exercised

- Node/npm on Windows in the isolated worktree.
- Playwright-managed Chromium for deterministic route/workflow E2E.
- Installed Google Chrome project through Playwright.
- Installed Microsoft Edge project through Playwright.
- Playwright-managed Chromium for explicit OCR smoke test.
- Existing generated-bundle Node harness with 77 generated-bundle app-handler executions retained.

## Exact commands and results

### `npm ci`

Exit code: 0

```text
added 89 packages, and audited 90 packages in 4s

5 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### `npm run build`

Exit code: 0

```text
> privypdf@0.1.0 build
> node scripts/build.mjs

Generated 10 tool routes and 5 beta information pages.
```

### `npm test`

Exit code: 0

```text
> privypdf@0.1.0 test
> node scripts/test-launch.mjs

PASS: syntax, 15 routes, metrics schema, route option initialization, page-range validation, XLSX and legacy XLS spreadsheet-to-PDF regressions; 77 generated-bundle app-handler executions across 10 generated PDFs plus malformed input.
NOT TESTED: browser rendering, OCR, camera, compression, redaction accuracy, encrypted inputs, browser network traffic, Safari/mobile, human task completion.
```

### `npm run test:e2e`

Exit code: 0

```text
> privypdf@0.1.0 test:e2e
> playwright test --project=chromium

Running 20 tests using 3 workers

1 skipped
19 passed (13.1s)
```

The skipped test is the explicit OCR local-only test, which requires `PRIVYPDF_RUN_OCR=1` and is run separately below.

### `npm run test:e2e:installed`

Exit code: 0

```text
> privypdf@0.1.0 test:e2e:installed
> playwright test --project=chrome --project=edge

Running 40 tests using 6 workers

2 skipped
38 passed (17.2s)
```

The two skipped tests are the OCR local-only test in the Chrome and Edge projects.

### `npm run test:e2e:ocr`

Exit code: 0

```text
> privypdf@0.1.0 test:e2e:ocr
> set PRIVYPDF_RUN_OCR=1&& playwright test tests/e2e/ocr.local.spec.mjs --project=chromium

Running 1 test using 1 worker

ok 1 [chromium] › tests\e2e\ocr.local.spec.mjs:18:3 › network-dependent OCR validation › searchable OCR creates a parseable PDF when English model access is available (4.5s)

1 passed (6.3s)
```

### `npm audit --omit=dev --audit-level=high`

Exit code: 0

```text
found 0 vulnerabilities
```

### `git diff --check`

Exit code: 0

```text
(no whitespace errors; Git emitted only line-ending normalization warnings for tracked text/built files on Windows)
```

## Defects found and fixed

- The visual organizer could render thumbnails while leaving the Apply button disabled. The failure happened because PDF.js cleanup ran before restoring the action state in the organizer render path. The fix re-enables the action when organizer state is valid, then performs PDF.js cleanup best-effort. The visual organizer E2E now moves a page, downloads the result, opens the output PDF, and verifies reordered content.

## Privacy-network evidence

- The E2E helper installs a per-page request guard during document processing.
- The guard fails on any non-local `POST`, `PUT`, or `PATCH` request.
- The guard fails if any request URL or request body contains the deterministic fixture filename `privypdf-e2e-marker-74291.pdf` or unique document marker `PRIVYPDF_E2E_MARKER_74291`.
- Passing Chromium, Chrome, Edge, and OCR runs produced no privacy guard violations.
- OCR allows only documented external model `GET` traffic to the Tesseract traineddata host when the explicit OCR test is enabled.

## Remaining gaps

- Safari, mobile browsers, Android Chrome, iOS Safari, and camera hardware capture were not tested.
- Visual fidelity of compression, scanner enhancement, edit placement, signature placement, redaction appearance, and organizer thumbnails was not proven.
- OCR accuracy was not proven beyond successful parseable-output completion.
- Compression quality and guaranteed target-size achievement were not proven.
- Redaction security was not proven beyond non-extractability of the synthetic target text in the automated case.
- Full hidden-data sanitization/security review was not completed.
- Password-protected documents and severely corrupted files beyond the malformed-PDF smoke check were not tested.
- Human pilot tester completion, unaided completion rate, operator identity/contact, privacy/terms legal review, public launch approval, indexing, and analytics decisions remain outside this task.

## Self-review

- Confirmed the work remains scoped to the isolated worktree and `codex/development-foundation` branch.
- Confirmed no deployment, public access change, accounts, payments, or remote analytics were added.
- Confirmed browser tests use roles, labels, and stable test IDs, without fixed sleeps.
- Confirmed downloaded artifacts are saved and parsed where feasible instead of relying only on status text.
- Confirmed all ten dedicated routes preserve `noindex,nofollow` and route selection behavior in browser tests.
- Confirmed the existing generated-bundle harness still reports the 77 app-handler executions and legacy `.xls` support.
- Confirmed production audit has zero vulnerabilities at the requested high audit level.

## Concerns

The task is complete with the remaining verification gaps listed above. They are product-launch concerns rather than blockers for Task 2's requested browser validation foundation.

# Task 2 fix round 1: OCR searchable-text verification

## Finding addressed

The prior OCR browser test uploaded a selectable-text PDF and only asserted that `searchable-ocr.pdf` opened as one page. A blank or textless OCR output could pass that test, so it did not prove end-to-end searchable OCR.

## Changes

- Replaced the OCR fixture path with an image-only scanned PDF fixture generated from a browser-rendered PNG and embedded into a PDF with `pdf-lib`.
- Added a precondition assertion that the input scan has no selectable target OCR phrase when parsed through the Node PDF.js helper.
- Strengthened the downloaded-output assertion to parse `searchable-ocr.pdf` through the independent Node PDF.js text extraction helper and require recognized searchable words from the scan.
- Normalization is limited to OCR-appropriate uppercase conversion and non-alphanumeric whitespace folding before checking words. The assertion still requires meaningful recognized words (`LOCAL`, `SCAN`, `ALPHA`, and `CLEAR`) rather than status text or page count.
- Kept the existing network privacy guard and added the OCR phrase to the marker list so request URLs/bodies cannot leak the scanned phrase.
- No product code change was required because the current browser OCR path already writes recognized text into the generated PDF text layer.

## Exact commands and results

### `npm run test:e2e:ocr`

Exit code: 0

```text
> privypdf@0.1.0 test:e2e:ocr
> set PRIVYPDF_RUN_OCR=1&& playwright test tests/e2e/ocr.local.spec.mjs --project=chromium

Running 1 test using 1 worker

ok 1 [chromium] › tests\e2e\ocr.local.spec.mjs:23:3 › network-dependent OCR validation › searchable OCR creates independently extractable recognized text (4.0s)

1 passed (6.0s)
```

### `npm run build` / `npm test`

A sandboxed attempt hit Windows filesystem restrictions in esbuild and left `dist/` incomplete. The same commands were rerun with elevated execution and passed.

Exit code: 0

```text
> privypdf@0.1.0 build
> node scripts/build.mjs

Generated 10 tool routes and 5 beta information pages.

> privypdf@0.1.0 test
> node scripts/test-launch.mjs

PASS: syntax, 15 routes, metrics schema, route option initialization, page-range validation, XLSX and legacy XLS spreadsheet-to-PDF regressions; 77 generated-bundle app-handler executions across 10 generated PDFs plus malformed input.
NOT TESTED: browser rendering, OCR, camera, compression, redaction accuracy, encrypted inputs, browser network traffic, Safari/mobile, human task completion.
```

### `npm run test:e2e`

Exit code: 0

```text
> privypdf@0.1.0 test:e2e
> playwright test --project=chromium

Running 20 tests using 3 workers

1 skipped
19 passed (13.1s)
```

The skipped test is the explicit OCR local-only test, which is covered by `npm run test:e2e:ocr` above.

### `npm run test:e2e:installed`

Exit code: 0

```text
> privypdf@0.1.0 test:e2e:installed
> playwright test --project=chrome --project=edge

Running 40 tests using 6 workers

2 skipped
38 passed (15.4s)
```

The skipped tests are the OCR local-only test in the Chrome and Edge projects.

### `npm audit --omit=dev --audit-level=high`

Exit code: 0

```text
found 0 vulnerabilities
```

## Self-review

- Verified the source OCR fixture is image-only by asserting the target phrase is not extractable before upload.
- Verified the output OCR PDF contains independently extractable recognized text via the Node PDF.js path, not product status text or page count alone.
- Confirmed the OCR test still uses a real browser, real file input, real download, no fixed sleeps, and scoped network assertions.
- Confirmed no accounts, payments, analytics, deployment, public access, dependency changes, or route removals were introduced.
- Confirmed the full Chromium browser suite and installed Chrome/Edge deterministic suites still pass with OCR skipped only in their default matrices.

## Concerns

OCR accuracy is still not broadly certified; the strengthened test proves one deterministic English image-only scan produces searchable recognized text. Safari/mobile/camera hardware, visual fidelity, compression quality, deeper redaction/security proof, full sanitization, and human completion remain unverified launch gates.
