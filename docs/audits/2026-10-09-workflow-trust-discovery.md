# Workflow, trust and discovery update

Checked 9 October 2026 with synthetic documents. This is a scoped beta check, not the deferred 100-case fixture plan or a physical-device validation.

## Changes

- Accessible selected-file ordering, keyboard focus retention, truthful totals and processing locks.
- Prepared-download filename/actual Blob size, repeat-download recovery and real compression size comparison.
- Reproducible merge/extraction guide inputs and reference page labels; public help and issue templates.
- GitHub private vulnerability reporting enabled following explicit owner authorization, confirmed through the repository API.

## Evidence

- `npm run build`, `npm test`: passed; 77 generated-bundle handler executions plus existing route/syntax/spreadsheet checks.
- `node scripts/test-ai-readiness.mjs`: passed; shared 88-entry registry, capability/metadata consistency and owner-private indexing policy.
- Successful Pages build followed by `playwright.pages.config.mjs`: 13 passed after the startup fix. Covers delayed initialization, actual merged/extracted output labels, PDF renderer/workers, ordering/processing locks, repeat-download byte equality, real compression sizes, public help and readable guide/blog paths.
- Root-path Chromium checks for core workflows, routes, ordering and results: 29 passed, one public-only support check intentionally skipped.
- After the startup fix, focused root-path core workflow, ordering and result checks: 20 passed, one public-only check intentionally skipped. The earlier route evidence remains scoped to the preceding implementation.
- Desktop 1440×1080 and narrow viewport 390×844 visual review: selected-file controls and prepared results fit without horizontal overflow; synthetic merge produced a parseable download, no uncaught page errors in the reviewed path.

An initial Pages build encountered a transient Windows file-write failure. Its subsequent test attempt is excluded from evidence. A clean rebuild succeeded. Two guide tests initially used incorrect expected download names; expectations were corrected to the stable app filenames and the focused suite passed.

The first remote Pages run (37890135878) stopped before deployment on a merge-guide download timeout; general CI succeeded. Inspection identified an early-selection race across async initialization. The workspace and picker now remain unavailable until route/catalog initialization completes, and the loading status remains visible. A new regression holds the extended module response, confirms controls remain unavailable, then releases initialization and verifies a real merge. Guide tests wait for the enabled picker before selecting files.

## Deployment and submission

Commit `82447d4` completed [Pages deployment 37890662015](https://github.com/mehbul/FolioCove/actions/runs/37890662015) and [general CI 37890662029](https://github.com/mehbul/FolioCove/actions/runs/37890662029) successfully. Live Chromium verification at the public URL produced three correctly labeled synthetic merge pages, an identical repeat download, actual size feedback, no viewport overflow, no uncaught page errors and no non-GET/HEAD requests in the reviewed flow. Public support and both worked-example guides returned HTTP 200. This does not establish behavior for all browsers or files.

The one-entry [awesome-pdf submission #76](https://github.com/karllhughes/awesome-pdf/pull/76) is open and awaiting review. It is not an accepted listing or traffic evidence.

## Remaining gaps

Actual phone camera capture, native phone downloads and Apple's Safari application remain unverified. Chromium viewport checks do not establish these outcomes. General-support email remains unset. Experimental redaction, unavailable sanitization/PDF-A and browser-dependent AI limits remain visible. Directory submission and indexing do not establish traffic or ranking results. Deployment requires a completed Pages workflow and live verification recorded separately.
