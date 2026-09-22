# PrivyPDF 30-day founder launch plan

Date: 2026-09-22

PrivyPDF is ready for a disciplined private beta, not a public launch. The product already has a credible wedge: private, browser-first PDF utilities that process documents on the user's device, with no accounts, payments, document-upload endpoint, or remote analytics. The current build includes ten launch-focus routes, five beta/legal documentation routes, optional local-only beta metrics, a 100 MB per-file beta limit, and a wider 74-tool catalog behind the same workspace.

The next 30 days should turn the current engineering evidence into launch confidence. Codex can handle the engineering, QA, documentation, launch analysis, and release preparation. The owner must provide business identity, legal/contact details, private access decisions, tester relationships, and final public-release approval.

## Current baseline

The repository is a reproducible Node 24 static app. `npm run build` regenerates `dist/`, `npm test` runs generated-bundle verification, `npm run test:e2e` runs Playwright-managed Chromium coverage, `npm run test:e2e:installed` covers installed Chrome and Edge on Windows, and `npm run test:e2e:ocr` explicitly validates OCR when the English model can be fetched.

Documented passing evidence includes:

- 15 generated routes: ten core tools plus privacy, security, limitations, terms, and testing pages.
- 77 generated-bundle PDF handler executions against synthetic PDFs and malformed input.
- Spreadsheet-to-PDF regressions for XLSX and legacy XLS.
- Browser E2E coverage for all ten launch-focus routes.
- Download validation for merge, extract, visual organize, target compression, CCITT scanned-PDF rendering through local PDF.js decoder assets, camera/photo-to-PDF, edit, typed sign, redact, and Privacy Inspector.
- Network guards that block external processing requests except the documented OCR English-model GET.
- Installed Chrome and Edge deterministic coverage.
- `npm audit --omit=dev --audit-level=high` documented as clean in the development report.

Known launch gaps remain:

- Safari, iOS Safari, Android Chrome, mobile layouts, and camera hardware capture are not verified.
- Compression quality, OCR accuracy, scanner enhancement, edit/sign placement, redaction appearance, and visual organizer fidelity are not proven by automation.
- Redaction security still needs independent output review; Privacy Inspector is read-only and sanitization downloads are disabled until independently audited.
- Password-protected, very large, and severely corrupted files need broader behavior mapping.
- No human pilot tester completion data exists.
- Operator identity, support contact, jurisdiction, public privacy policy, public terms, indexing, and final analytics posture are unresolved.
- The current git working tree has an unrelated modified `.gitignore`; do not overwrite or normalize it unless the owner asks.

## Positioning

Use a narrow public promise:

> PrivyPDF gives privacy-conscious workers a fast set of browser-based PDF tools for everyday document cleanup, conversion, review, and sharing checks. Files are selected locally and processed on the device; the app has no document-upload endpoint.

Avoid stronger claims until external review catches up:

- Do not claim certified security, guaranteed sanitization, guaranteed redaction, full offline support, legal e-signatures, archival validity, compliance readiness, or perfect layout conversion.
- Do not position the product as an enterprise DLP, malware scanner, cryptographic signing service, encrypted cloud vault, or legal records system.
- Keep the private-beta warning: users must keep originals and inspect every output.

The private beta should focus on the ten launch-focus tasks because they are already routed, documented, and browser-tested:

1. Merge PDFs.
2. Extract pages.
3. Visual page organizer.
4. Compress to target size.
5. Camera document scanner.
6. Searchable OCR PDF.
7. Edit PDF.
8. Sign PDF.
9. Secure redact.
10. Privacy Inspector.

The wider 74-tool catalog can remain available as exploratory beta utility, but public messaging should not imply every long-tail conversion and intelligence tool is equally launch-hardened.

## Work split

Codex can complete autonomously:

- Expand deterministic QA fixtures and browser coverage.
- Run and summarize build, bundle, E2E, installed-browser, OCR, audit, and whitespace checks.
- Prepare tester guide updates, issue templates, beta feedback templates, release notes, launch checklist, support macros, incident runbook, FAQ, changelog, and public-page copy drafts.
- Tighten docs around privacy boundaries, known limitations, browser support, and output verification.
- Analyze beta result CSVs once the owner places them in the repo.
- Prepare sitemap/indexing changes behind a clear final approval step.
- Prepare analytics architecture options that preserve the privacy model.
- Prepare a public-launch PR or patch bundle for owner review.

Owner-only inputs:

- Legal operator name, business address or public jurisdiction approach, support email/contact, and any required company registration or imprint details.
- Legal review and approval of public privacy policy, terms, limitation language, and support commitments.
- Private access control decisions for the beta host.
- Tester relationships and consent. Codex must not send invitations or contact testers.
- Any use of real brand/customer names, testimonials, screenshots from user documents, press contacts, or partner outreach.
- Final public-release approval, including removing `noindex,nofollow`, publishing a sitemap, changing access, or announcing publicly.

## 30-day plan

### Days 1-3: Freeze launch scope and evidence ledger

Priority: prevent the public plan from expanding faster than the evidence.

Codex actions:

- Create a launch evidence ledger that maps each of the ten launch-focus tools to automated coverage, human-test fixtures, known limitations, and go/no-go status.
- Re-run `npm run build`, `npm test`, `npm run test:e2e`, `npm run test:e2e:installed`, `npm run test:e2e:ocr`, `npm audit --omit=dev --audit-level=high`, and `git diff --check`; record exact results.
- Review all five beta/legal pages for consistency with the current privacy model.
- Draft a short public positioning page that leads with local processing and keeps stronger claims out.

Owner inputs:

- Confirm the ten launch-focus tools are the public-launch scope.
- Provide operator identity placeholder or confirm that public launch cannot proceed until legal identity is ready.

Gate:

- No launch-scope tool is missing from the evidence ledger.
- All current commands pass or have a documented owner-visible blocker.
- Public copy contains no unsupported security, redaction, compliance, or offline claims.

### Days 4-7: Human private-beta workflow

Priority: collect task-completion evidence without collecting documents.

Codex actions:

- Update the tester workflow so it uses synthetic or non-sensitive documents only.
- Prepare a local `docs/beta/tester-workflow.md` with task steps, browser matrix, fixture categories, and rules for reporting issues without attaching documents.
- Prepare a local `docs/beta/issue-triage.md` that turns reports into severity, affected tool, browser, fixture type, reproduction status, and privacy risk.
- Prepare a sanitized feedback template based on `src/static/tester-results.csv`.

Owner inputs:

- Select 20 consenting testers and grant private access.
- Share the existing invitation text manually if desired. Codex must not send invitations.
- Decide whether testers may use their own non-sensitive files after completing synthetic fixtures.

Tester workflow:

- Tester opens the private beta and completes one task unaided before reading help.
- Tester records tool, browser, fixture type, completion, output correctness, help needed, and sanitized issue category.
- Tester never sends documents, document text, filenames, hidden metadata, screenshots with sensitive content, or personal information as feedback.
- Tester may share local-only metrics export only after reviewing it; the export contains tool ID, outcome, and duration only.

Gate:

- At least 20 testers are recruited by the owner.
- At least 100 tool/fixture cases are planned across the ten launch-focus tools.
- Feedback workflow has a clear "do not send documents" rule in every tester-facing artifact.

### Days 8-14: Cross-browser and output-quality hardening

Priority: find defects that automation and desktop Chromium miss.

Codex actions:

- Extend deterministic fixtures for rotated pages, mixed page sizes, image-heavy PDFs, forms, Unicode text, scans, password-protected input, wrong file types, and malformed/truncated files.
- Add or refine automated tests for behavior that can be checked safely: clear errors, no misleading downloads, parseable outputs, route selection, local asset loading, and network-request blocking.
- Build a manual output-inspection checklist for compression readability, edit placement, signature placement, scanner output, organizer thumbnails, OCR searchability, redaction appearance, and privacy cleanup.
- Analyze incoming tester CSVs and classify issues daily.

Owner inputs:

- Provide access to physical devices or tester coverage for Safari, iOS Safari, Android Chrome, and real camera capture.
- Decide whether Safari/mobile failures block public launch or become explicitly unsupported at launch.

Gate:

- Chrome, Edge, Safari desktop, iOS Safari, and Android Chrome each have a recorded result for the ten launch-focus tasks or an explicit "unsupported at launch" decision.
- No critical data-loss, misleading-download, external-upload, or redaction/privacy defect remains open.
- At least 18 of 20 pilot testers complete one launch-focus task without assistance.

### Days 15-20: Privacy, analytics, support, and incident process

Priority: make the operating model credible before opening access.

Codex actions:

- Draft public privacy policy and terms from the current beta notices, with owner placeholders marked clearly.
- Draft support macros for: failed processing, wrong output, OCR quality, compression quality, redaction caution, browser support, privacy/network question, and suspected incident.
- Draft an incident runbook for privacy or output-integrity issues.
- Prepare an analytics decision memo with three options:
  - No remote analytics for public launch; use only aggregate server logs from the host and voluntary local exports.
  - Privacy-preserving event analytics later, opt-in only, with no filenames, document contents, hashes, raw errors, IP enrichment, or user identifiers.
  - Self-hosted or first-party analytics later, added only after legal/privacy review and consent UX.

Recommended analytics choice for launch: no remote product analytics. Keep optional local metrics only. Use tester CSVs, support reports, and host-level operational logs for the first public release.

Owner inputs:

- Supply legal identity, contact channel, jurisdiction, and legal reviewer decisions.
- Choose analytics posture.
- Choose support response target and public support hours.

Support process:

- Daily during private beta: review new reports, tag severity, reproduce if possible, update known issues.
- Public launch week: check support twice daily; acknowledge privacy/security reports within one business day.
- Severity 0: possible document upload/leak, public access breach, destructive output without warning, or redaction/privacy failure. Freeze public rollout, preserve evidence, remove or disable affected path if needed, and publish status/update after owner approval.
- Severity 1: common task failure, broken route, misleading success, browser family broken. Fix before public launch.
- Severity 2: quality issue with workaround or clear warning. Can launch only if documented and not privacy/security-sensitive.
- Severity 3: copy, cosmetic, or low-impact usability issue. Track post-launch.

Gate:

- Public policy and terms have owner-approved identity/contact fields.
- Incident runbook exists and has a named owner contact.
- Analytics posture is explicitly decided before any public indexing or announcement.

### Days 21-25: Public-launch package

Priority: prepare the launch without flipping public access prematurely.

Codex actions:

- Prepare a public launch checklist with every file/change needed for general availability.
- Draft homepage and docs copy updates.
- Draft release notes and a concise launch announcement.
- Prepare SEO basics only after owner approval: sitemap, indexable routes, title/description metadata, canonical routes, and no unsupported claims.
- Prepare launch-day QA script.
- Create a rollback plan that restores private/noindex state and documents what evidence must be preserved.

Owner inputs:

- Approve final launch copy.
- Approve whether the site remains private, becomes public but quiet, or launches with announcement.
- Provide any public brand assets, screenshots, founder quote, or audience/channel choices.

Gate:

- Launch package is reviewable without hidden manual steps.
- Rollback path is documented.
- Owner has approved legal, privacy, support, analytics, and public copy.

### Days 26-30: Go/no-go and public release

Priority: make a binary release decision from evidence.

Codex actions:

- Run the final verification matrix.
- Produce a launch-readiness report with pass/fail gates, open issues, and residual risks.
- If go: prepare the final public-release changes for owner approval.
- If no-go: create a focused fix plan and keep private beta/noindex unchanged.

Owner inputs:

- Final public-release approval.
- Final access/indexing decision.
- Final announcement decision.

Go criteria:

- Build, generated-bundle tests, Chromium E2E, installed Chrome/Edge E2E, OCR smoke, audit, and whitespace checks pass.
- Safari/mobile/camera are either passing for the launch-focus tasks or explicitly excluded from launch claims.
- 100 tool/fixture cases are reviewed.
- At least 18 of 20 pilot testers complete one launch-focus task without assistance.
- No open Severity 0 or Severity 1 issues.
- Redaction, Privacy Inspector, OCR, compression, scanner, edit, and sign limitations are visible in product/docs.
- Public privacy policy, terms, support contact, and operator identity are owner-approved.
- Analytics posture is approved and does not contradict the privacy promise.
- Owner explicitly approves public release.

No-go criteria:

- Any evidence of document content leaving the browser during processing outside the documented OCR model fetch.
- Any redaction or privacy-cleanup path that presents unsafe output as safe.
- Any common workflow creates corrupt or misleading downloads without a clear error.
- Legal/operator identity or support contact remains missing.
- Owner has not approved final public release.

## Private beta metrics

Keep optional metrics local by default:

- Record only tool ID, outcome, and duration on the tester's device.
- Cap stored records at the existing 1,000-record limit.
- Keep filenames, document content, hashes, identifiers, and raw errors out of metrics.
- Let testers export metrics voluntarily after reviewing them.

Do not add remote analytics during the 30-day plan unless the owner approves a privacy-reviewed consent design. For public launch, rely on tester results, support volume, host operational signals, and qualitative feedback.

## Launch-channel approach

Use the launch skill's phased approach, but keep this launch intentionally quiet until the gates pass.

Owned channels:

- Product website.
- A simple release note or blog-style changelog.
- Owner-controlled email or direct messages, sent manually by the owner only.

Rented channels:

- Defer Product Hunt, Hacker News, Reddit, and broad social launch until after public stability is proven.
- If the owner wants a public announcement in this 30-day window, use one restrained post that says "public beta" and links to the limitations.

Borrowed channels:

- Do not pursue borrowed-audience launches before the first public release unless the owner already has trusted contacts. Broad borrowed-channel traffic is risky before mobile/Safari/human evidence is strong.

## Next three actions

1. Codex should create the launch evidence ledger and beta tester workflow docs.
2. Owner should confirm the ten launch-focus tools and provide operator identity/contact placeholders.
3. Codex should run the full verification matrix and write a dated readiness snapshot before any access/indexing change.
