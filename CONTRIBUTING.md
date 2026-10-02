# Contributing to FolioCove

Start with README.md and AGENTS.md. Keep document processing on-device and use synthetic fixtures only. Discuss large feature changes in an issue before implementation. Existing tool IDs, local preferences and output names should stay stable.

For code changes, run npm run build and npm test. Check AI-readable changes with node scripts/test-ai-readiness.mjs. Deployment/path changes also require node scripts/build-pages.mjs and npx playwright test --config=playwright.pages.config.mjs; restore the ordinary build afterwards. Choose focused browser checks rather than the deferred 100-case plan.

Bug reports are public. Do not attach personal documents, extracted contents, passwords, tokens or private contact details. Describe device/browser, tool, steps and expected/actual behavior using synthetic files. No response-time commitment is offered during this beta.

Source uses the MIT license. Dependencies retain their own licenses. Do not add copied proprietary brand assets, unverified capability claims or remote document processing.
