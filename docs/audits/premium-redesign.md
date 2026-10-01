# FolioCove premium redesign — 2026-10-02

The owner requested design-taste-frontend, impeccable and emil-design-eng with real design inspiration such as Airbnb, and confirmed that visitors should reach tools immediately.

The existing static application now uses a coherent white/charcoal/coral design, self-hosted DM Sans, Phosphor icons, visual core-tool discovery, working category/search filters and a lighter PDF workspace. Ten core routes and all policy pages share the stylesheet. Previews are rendered from synthetic PDF pages by `scripts/create-design-assets.mjs` and are labeled as examples. No customer claims or testimonials were added.

Verification:

- Build and generated-bundle suite passed, including 77 PDF handler executions.
- Core Chromium browser suite: 24 passed, covering downloads and privacy/redaction regressions.
- Discovery checks passed: category filters, search, no-results feedback, 10 cards, no missing images, no desktop/mobile horizontal overflow.
- Desktop and mobile screenshots received an independent finish review: static visual direction, hierarchy and source color contrast passed. Browser-computed contrast was not measured. The detector used a degraded regex fallback, which does not establish a full accessibility audit.

Public access, noindex, processing behavior and beta limitations are retained. Physical phone, Safari and camera testing remain unverified.
