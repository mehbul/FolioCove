# M02 validation report

Date: 2026-09-23

Branch: `codex/validation-m02`

Case: M02 only

Result: PASS

## Scope

This change implements only validation matrix case M02 from `validation-100-plan.md`. It adds a separate M02 Playwright test to `tests/e2e/validation/merge.spec.mjs`. It does not change product code, M01 behavior, shared helpers, package scripts, CI configuration, or any later validation case.

## Synthetic fixtures

The test creates three one-page PDFs at runtime with `pdf-lib` in a unique temporary directory. Each fixture has an explicit MediaBox, a smaller non-default CropBox, a distinct rotation, and a unique text marker. Successful test cleanup removes the inputs and downloaded output, and no generated binary is committed.

| Upload order | Input | Shape | Marker | MediaBox (`x, y, width, height`) | CropBox (`x, y, width, height`) | Rotation |
|---:|---|---|---|---|---|---:|
| 1 | `pvp-m02-portrait.pdf` | Portrait | `PVP-M02-PORTRAIT` | `5, 10, 420, 640` | `17, 28, 390, 600` | 0° |
| 2 | `pvp-m02-landscape.pdf` | Landscape | `PVP-M02-LANDSCAPE` | `0, 0, 720, 420` | `24, 18, 672, 384` | 90° |
| 3 | `pvp-m02-square.pdf` | Square | `PVP-M02-SQUARE` | `8, 12, 510, 510` | `26, 30, 474, 474` | 270° |

Before browser navigation, both parsers independently inspect every source fixture. Those checks establish that the generated source bytes contain one page, the expected marker, the literal MediaBox and CropBox values within 1 point, and the exact rotation in both `pdf-lib` and PDF.js. PDF.js also validates the CropBox-derived page view.

## Browser workflow and assertions

The existing privacy/page guard is installed before navigation to `/merge-pdf/`. It records uncaught page errors, unapproved external requests, and fixture marker or filename leakage in request URLs and bodies. The test also registers a download listener before navigation.

The browser verifies the merge tool title, beta limitation notice, PDF-only file input, and `noindex,nofollow` metadata. It uploads the portrait, landscape, and square PDFs in that order, requires the run control to become enabled, and starts the download wait before clicking. The successful contract is exactly one download named `merged.pdf` and a visible successful completion status.

The downloaded bytes are opened independently by `pdf-lib` and PDF.js. Assertions require:

- exactly three pages from both parsers;
- exactly one expected marker on each output page in portrait, landscape, square upload order;
- output MediaBox and CropBox coordinates and dimensions equal to the corresponding independently inspected source page within 1 point;
- `pdf-lib` and PDF.js rotations equal to the source rotations with 0° tolerance;
- PDF.js page views equal the expected CropBoxes within 1 point;
- effective PDF.js viewport sizes of 390 x 600, 384 x 672, and 474 x 474 points, matching the separately inspected source viewports after rotation;
- exactly one download and zero privacy/page guard violations.

The test attaches `M02-oracle-results` JSON to the Playwright result with source/output parser data, browser project, duration, completion status, output byte length, and download events.

## Environment

- Windows, PowerShell
- Node.js v24.15.0
- npm 11.12.1
- Playwright 1.63.0
- Playwright project: bundled Chromium using `Desktop Chrome` device settings

## Commands and results

1. `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --grep M02 --reporter=list` — PASS. 1/1 passed; test body 809 ms; command 3.3 seconds.
2. `npm run build` — PASS. Generated 10 tool routes and 5 beta information pages.
3. `npm test` — PASS. Syntax, 15 routes, metrics schema, route option initialization, page-range validation, XLSX and legacy XLS spreadsheet-to-PDF regressions, and 77 generated-bundle app-handler executions across 10 generated PDFs plus malformed input.

## Limitations and concerns

No MediaBox, CropBox, ordering, download-count, guard, or rotation mismatch was found, so M02 required no product change. This focused implementation proves M02 in the configured bundled Chromium project. Installed Chrome, Edge, WebKit, mobile emulation, M03–M10, and all non-merge validation rows remain outside this task. The production build rewrote generated `dist/assets` files only through local line-ending normalization; those generated-only working-tree changes were restored and are not part of the commit.
