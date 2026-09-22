# Security hardening report

Date: 2026-09-22. Branch: `codex/security-hardening`.

## Implemented fixes

- Privacy Inspector is now read-only. The sanitized sharing-copy checkbox is disabled and unchecked, stale forced/saved cleanup paths fail closed, and status text explicitly says no sanitized sharing copy was created.
- The Sanitize PDF tool now fails closed with no download until hidden-data removal can be independently verified.
- Clean metadata was relabeled to "Clear PDF info fields" and now downloads `standard-info-fields-cleared.pdf`, making clear it only clears standard document-info fields. The probe confirms XMP, fields, and orphaned action data are not claimed as removed by this limited tool.
- Redaction now validates that the target page is an integer within the loaded PDF and that the percentage rectangle is finite, nonempty, and entirely within the page. Output is created only if exactly one redaction rectangle is applied.
- PDF-to-Excel and Extract contacts now use one CSV exporter that quotes every field, doubles embedded quotes, normalizes line endings, and prefixes spreadsheet-triggering values such as `=1+1` and `+15551234567` with a single quote.
- Product copy, limitations/testing docs, security probe artifacts, route tests, and generated `dist/` files were synchronized with the new behavior.

## Verification evidence

- `npm run build` passed and regenerated `dist/`.
- `npm test` passed: generated bundle syntax/routes/metrics/page ranges and spreadsheet-to-PDF regressions.
- `npm run test:e2e` passed in Chromium: 23 passed, 1 OCR test skipped by design. This includes redaction invalid-input no-download checks, read-only Privacy Inspector, fail-closed Sanitize, and safe CSV export regressions.
- `node docs/audits/security-probe.mjs` passed against the local generated app. The resulting `security-probe-results.json` shows Privacy Inspector, Sanitize, and invalid redaction page produce no downloads; PDF-to-Excel emits `"1","'=1+1"`; contacts emits safe phone and escaped URL fields.

## Remaining concerns

- Verified full-document sanitization remains unavailable. Re-enabling it still requires an independently audited sanitizer that proves removal across XMP, forms/XFA, embedded files, annotations/actions, named resources, and orphan indirect objects.
- Redaction still uses experimental raster output; valid-region output should continue to be independently inspected before sensitive release.
- The broader resource-budget and production-header items from the audit remain outside this scoped patch.
