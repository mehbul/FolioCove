# Search and answer readability

16 October 2026. Scoped implementation audit; this is not ranking or citation evidence.

## Change

The public Pages build adds visible Home-to-task breadcrumbs and matching BreadcrumbList data to all 15 task workspaces. Application metadata explicitly describes free access with a zero-price Offer. No ratings, customer counts or rich-result eligibility are invented.

The shared task instructions and output expectations also generate `/FolioCove/docs/task-instructions.md`, linked visibly from each task page, from alternate-format metadata and from llms.txt. This copies existing human-readable instructions into a useful reading format rather than producing separate keyword pages. Fidelity limits, conditional AI, experimental redaction, unavailable sanitization/PDF/A and the physical-device validation gap remain explicit.

The private Sites build and its audience/indexing policy are unchanged. No document uploads, remote analytics, customer-data access or hidden crawler-specific content were added.

## Local verification

- The new no-JavaScript browser check first failed on absent breadcrumbs, then passed across all 15 task pages at a narrow viewport. It compares visible breadcrumb labels with structured data, checks free-use metadata and follows the plain-text link to compare output expectations with the HTML.
- All 19 Pages browser checks passed, including synthetic PDF downloads, conversion routes, guide examples, ordering and rendering.
- Root build, 77 generated handler cases and the 88-entry AI-readiness check passed. Root output was restored before committing; the Pages-only additions are generated in the deployment workflow.
- Deployment still requires the actual completed workflow and live changed-page verification; local checks alone do not establish deployment.

## Interpretation and official sources

[Google's AI-feature guidance](https://developers.google.com/search/docs/appearance/ai-features) says ordinary SEO practices apply and special AI markup/files are not required. Markdown is an alternative reading format, not an established ranking signal. [Google's documentation updates](https://developers.google.com/search/updates) record FAQ rich-result deprecation in May 2026. This work does not promise FAQ/HowTo rich results or add fake reviews to qualify for application results. Indexing, retrieval, citation and ranking are separate outcomes.

OpenAI's [crawler documentation](https://developers.openai.com/api/docs/bots) distinguishes search crawling from training. Training-crawler access is not a prerequisite for search discovery. The robots.txt at this project's subpath does not control the GitHub host root; changing it does not configure unrelated host-root crawler policies.

The existing indexing requests and sitemap submission are not repeated by this change. Continue the discovery monitor and use actual Search Console evidence to choose later content work. This audit does not establish a first-page ranking or AI citation.
