# FolioCove AI readiness — 2 October 2026

## Implemented

The ai-seo and schema skills informed this change. The site has a static /tools/ directory for all 88 catalog entries, visible questions/answers, distinct core-route descriptions/canonical URLs, Organization/WebSite/WebPage/WebApplication JSON-LD, and /llms.txt linking /docs/capabilities.md and /capabilities.json. Tool IDs, input MIME types, local processing, release state, unsupported and experimental features are explicitly described. Query links /?tool=ID select actual extended workspaces and ignore unknown IDs.

Tool definitions now live in src/content/tools.mjs and are consumed by runtime and build outputs. AGENTS.md and README.md guide coding assistants through source ownership, privacy constraints, verification scope and hosting. Knowledge files contain product information only; they do not collect or transmit selected files. No remote AI processing was added.

## Verified

- Build and 77 local handler executions passed; these are repeated fixture cases, not 77 distinct tools.
- Generated-file checks passed for all 88 entries, directory links, status consistency, canonical URLs, JSON-LD and indexing controls.
- 12 focused Chromium checks passed for readable-without-JavaScript directory content, validated workspace links and ten core routes.
- The 21-check short Android/iPhone/WebKit pilot passed again after the registry refactor.
- Physical phones and actual Apple's Safari application are still unverified. Existing device checklist: mobile-safari-pilot-2026-10-02.md.

## Discovery remains disabled

Owner-private hosting, noindex,nofollow and robots.txt Disallow: / remain in effect. No public sitemap is emitted. Search/AI discovery cannot be evaluated as a public site until operator contact/policies/device checks are handled and access/indexing are deliberately changed. Machine-readable files do not bypass private access or guarantee AI citations, rankings or recommendations.

Google's official guidance says no special AI files or markup are required for AI Overviews/AI Mode; indexed, helpful textual content and consistent structured data matter. llms.txt is a supplemental proposal, not a universal ingestion or ranking standard. OpenAI documents separate search and training crawlers; do not conflate search discovery with private-file training consent.

References:
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots
- https://llmstxt.org/

## Remaining owner actions

Set up a public support inbox, finalize public notices, perform the five-minute physical camera/download/Safari pilot, then authorize and validate public access/indexing. There is no claim that the physical checks have been performed remotely.
