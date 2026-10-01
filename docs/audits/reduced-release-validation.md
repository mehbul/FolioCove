# Reduced beta release validation — 2026-10-02

The owner approved deferring the expanded 100-case validation plan. Existing M01–M10 and S01–S02 tests are retained; implementing the other 88 cases is no longer a release requirement.

## Verified for this release

- `npm run build`: passed.
- `npm test`: passed, including 77 generated PDF handler executions and spreadsheet regressions.
- Core Chromium route/workflow suite: 24 passed. Covers downloads, malformed and unsupported inputs, redaction region rejection and rendered output, read-only Privacy Inspector, fail-closed sanitization, CSV neutralization and network guards.
- Explicit OCR suite: 1 passed, including independent extraction of recognized words.
- `npx playwright test --config=playwright.mobile.config.mjs`: 20 passed across 375×812 and 412×915 viewports. This verifies route controls in Chromium emulation, not physical devices.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilities reported.

## Remaining evidence and public access

Real Safari, iOS, Android and camera hardware testing and a small human pilot remain pending. Full sanitization stays disabled; experimental redaction outputs require independent inspection. These checks do not certify output accuracy or security.

Public operator name, support contact and jurisdiction are still awaiting owner input. Until those details are supplied, the validated update preserves the existing owner-only access and noindex settings. Public launch was requested but has not yet been completed.
