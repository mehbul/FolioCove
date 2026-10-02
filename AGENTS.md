# Working on FolioCove

FolioCove is a static browser PDF workspace. Read README.md, PRODUCT.md and DESIGN.md for context; use the implementation and current audit evidence for capability claims.

## Source map

- `src/content/tools.mjs`: shared definitions for the 74 base and 14 extended tools. The browser and generated capability catalog consume this registry.
- `src/app/index.mjs`: base handlers and workspace state. `src/app/extended.mjs`: extended handlers. `src/app/launch.mjs`: discovery, limits and local metrics.
- `src/content/routes.mjs`: ten core routes and information-page copy. `src/content/ai.mjs`: static directory, capability exports and JSON-LD. `src/content/site.mjs`: site identity and beta status.
- `scripts/build.mjs`: generates `dist/`. Edit source, then rebuild; do not patch generated output alone.
- `docs/audits/`: scoped validation evidence, limitations and the physical-device checklist.

## Product boundaries

Keep document processing on-device. Do not introduce document uploads, remote AI processing, remote analytics or private-file training use unless the owner explicitly changes that preference. Model downloads are distinct from document uploads. Never expose credentials or real customer documents in fixtures, logs or public knowledge files.

Keep tool IDs, local preference keys, accessible controls and output names stable unless the task requires a change. Show fidelity and browser requirements before processing. Sanitization and PDF/A are unavailable, redaction is experimental, and browser AI is conditional. The owner authorized a public GitHub Pages beta and public source/history on 2 October 2026. Search indexing remains disabled. The separate Sites publication remains owner-private; preserve its audience.

## Verification

Run `npm run build` and `npm test` for source changes. Choose focused Playwright checks that exercise the behavior changed; the full 100-case fixture plan is deferred. The short pilot is `npx playwright test --config=playwright.pilot.config.mjs`; custom WebKit installs can use `FOLIOCOVE_WEBKIT_EXECUTABLE`. Emulation/WebKit checks do not establish physical camera capture, native phone downloads or Apple's Safari-app behavior. Report tested scope and remaining gaps precisely.

To verify AI-readable outputs, run `node scripts/test-ai-readiness.mjs`. Generate discovery content from the shared registry and keep visible copy, JSON-LD and machine-readable limits consistent. No fake reviews, ratings, operator contact details, certifications, ranking claims or completed device tests.

The primary public beta is https://mehbul.github.io/FolioCove/. Push verified source to main; .github/workflows/pages.yml builds, tests and deploys it. scripts/build-pages.mjs adapts the generated site to the /FolioCove/ project path. Verify changed deployment behavior with playwright.pages.config.mjs; restore the root build with npm run build before committing generated dist files. Report deployment success only from the completed GitHub workflow and live verification when behavior changed.

The separate Sites host uses the existing project ID in `.openai/hosting.json`. Use the Sites publishing workflow only when that host is being updated, preserving owner-private access. See docs/OPERATIONS.md for incident and release priorities.
