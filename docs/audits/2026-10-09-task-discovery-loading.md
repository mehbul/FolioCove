# Task discovery and loading — 9 October 2026

## Change

The public merge and extraction pages now answer task-specific questions below the immediate workspace. Merge explains file order, compression expectations, scanned pages and signature limitations. Extraction documents comma-separated selections, ascending ranges, entry order, duplicate suppression, invalid-range recovery and the single-output boundary. Both pages link directly to synthetic sample files and to the existing worked guides. There are no new keyword-only routes, fake reviews, unsupported competitor comparisons or ranking guarantees.

Page descriptions, Open Graph descriptions and WebApplication descriptions agree. Application names identify FolioCove consistently on all ten task routes. GitHub's description was updated to the same brand and local-processing position; its homepage remains the Pages beta. The awesome-pdf PR #76 is open with no reviews. No new directory submission or follow-up message was sent.

The startup bundle now minifies whitespace, keeping identifiers stable for the generated-handler checks and retaining dependency notices. Tool routes no longer construct the hidden homepage catalog, while the homepage still exposes 35 cards and the sidebar retains 88 tools. No processing handler, output filename, document-upload mechanism or local preference key was changed.

## Controlled mobile measurement

Windows-hosted Chromium with Pixel 7 emulation, a fresh context, service workers blocked, cache disabled, 150 ms network latency, 200,000 bytes/second download throughput and 4× CPU slowdown. The local server served uncompressed files. Each route was measured once before and once after; these are diagnostic samples, not a benchmark distribution, production Core Web Vitals, a Lighthouse score or physical-phone evidence.

| Metric | Before | After |
| --- | ---: | ---: |
| Application script bytes | 4,422,624 | 2,992,310 |
| Merge route resource transfer bytes | 4,774,245 | 3,159,741 |
| Merge route preview bytes | 179,041 | 0 |
| Merge route resource entries | 49 | 39 |
| Merge workspace ready | 24,990 ms | 17,044 ms |
| Homepage workspace ready | 25,006 ms | 17,722 ms |

The script is about 32% smaller. First contentful paint stayed around one second in this setup; the improvement affected workspace readiness rather than the initial text paint. Production compression, caching, network conditions and device performance can produce different timings. Further module splitting remains a potential improvement; it has not been shipped by this change.

## Verification

- Root build, 77 generated handler executions and the 88-entry AI-readability check passed.
- 24 Chromium checks passed across direct routes and core workflows, including PDF rendering, scan-photo import, compression, typed signing, redaction error handling and malformed inputs. These do not establish full fidelity or redaction safety.
- 15 public Pages checks passed, including no-JavaScript help and matching metadata, sample downloads, the three published range recipes, repeated-page suppression, invalid-range recovery, no hidden preview requests, ordering and repeat downloads.
- Three focused merge/extraction checks passed on Android/Chromium emulation, iPhone/WebKit emulation and desktop WebKit. The installed workspace-local WebKit executable was used after the default location was found absent. These are not native Safari-app or physical phone tests.
- Desktop 1440×1080 and mobile 390×844 inspection of both help sections found readable table/copy, no horizontal page overflow, missing sample links or page errors. No visual-world replacement was made.
- The ordinary root build was restored after Pages checks, preserving the separate owner-private Sites publication's generated audience and routes.

Deployment completion and live availability require the release's successful Pages workflow and live check; these local checks alone do not establish deployment success.

## Search evidence and limits

Search Console's 28-day Web view still showed two impressions and zero clicks, with only the homepage in the page table and no query details available. Data shown covered 30 September–6 October. Homepage inspection confirmed index membership. That does not establish ranking for generic PDF searches; see SEARCH-DISCOVERY.md for the manual query observations and next decision criteria.

Documents still process on-device. Redaction remains experimental, browser AI conditional, sanitization and PDF/A unavailable. Physical camera capture, native phone downloads, Apple's Safari application and a general-support inbox remain unverified or pending. No monitoring schedule, paid listing, outreach campaign or analytics script was created.
