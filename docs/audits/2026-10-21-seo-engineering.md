# iHatePDF SEO and engineering audit — 21 October 2026

## Live findings before optimization

- All 40 sitemap URLs returned HTTP 200 with distinct titles and canonicals matching their URLs, one H1, descriptions and parseable structured data. Titles use iHatePDF. Existing FolioCove aliases and URLs are intentional migration continuity.
- Sitemap, manifest, capability catalog and AI reading index returned successful responses with appropriate content types. A deliberately missing page returned 404, rather than a soft 404.
- The host-root robots file returned 404; the project-level robots copy is informational. No host-root disallow directive was observed. This does not explain Search Console's sitemap warning.
- A fresh desktop homepage load had no broken images, missing image alt attributes, page errors, failed asset responses or third-party asset requests. This is a scoped startup observation, not a guarantee for every tool or model download.
- Production dependency audit: zero known vulnerabilities reported by npm on this date. No penetration test or security certification is implied.
- Axe WCAG 2 A/AA and 2.1 AA checks found zero automated violations on the homepage, merge, PDF-to-Word, How it works, directory and support pages at 1280 and 390 pixels. Some homepage/How it works contrast checks remained inconclusive. Manual accessibility and assistive-technology testing remain separate.
- Fresh desktop startup transferred approximately 1.53 MB of resource bodies. The main app alone was 4,058,147 decoded bytes (1,035,514 transferred bytes in this sample). The main bundle inlined specialist dynamic imports.

## Search Console evidence

The Page indexing report showed one indexed page and zero listed exclusion reasons, with a displayed last update of 12 October 2026. This is stale coverage evidence, not a current count of all eligible pages. Core Web Vitals showed no field data. Sitemap details still said "Sitemap could not be read", with last read 15 October and zero discovered pages. The current public sitemap fetch succeeded. No new submission was made; previously accepted requests were preserved. The cause of Google's earlier fetch failure remains unverified.

## Engineering change

The esbuild browser build now emits shared chunks and lazy library bundles across the application, extended tools and qpdf worker. Stable entry URLs remain `app.js`, `extended.js` and `qpdf-worker.js`. The local OCR-worker fallback patch applies to every emitted JS bundle. The generated-handler harness resolves split imports to local files, preserving its existing handler executions. Mammoth and Tesseract CommonJS default exports are normalized explicitly for split text-conversion and OCR paths. A real English OCR run passed with independently extracted recognized text after splitting; it downloads the permitted language model while keeping the document local.

The new startup regression checks the app-entry byte budget and verifies specialist PDF/Office/OCR bundles are not requested during initial discovery. Existing conversion, encryption, worker and download tests exercise deferred loading. No document uploads, remote analytics, new production dependencies or private Sites audience changes were introduced. Local preferences, tool IDs and output names remain stable.

## Remaining limits

Real Android/iPhone camera capture, native downloads and Safari-app behavior remain unverified. Browser timings here are lab observations without a mobile network throttle, not field Core Web Vitals or ranking evidence. GitHub Pages does not supply an application CSP header in the observed response; Office/HTML document-rendering frames retain their separate restrictive policies. This audit does not establish complete security or full conversion fidelity.

Sanitized detailed evidence is stored locally under `.sites-runtime/proof/engineering-seo-live-2026-10-21.json` and `accessibility-audit-2026-10-21.json`; release checks record deployment and post-change measurements separately.
