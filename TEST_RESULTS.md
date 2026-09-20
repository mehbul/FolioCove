# Private beta validation

Command: `node --experimental-vm-modules scripts/test-launch.mjs`

Passed:
- Main script, launch module and service worker parse successfully.
- Ten dedicated tool routes and five documentation routes exist.
- Tool-specific controls initialize for direct selection (compression and signatures).
- Metrics expose only tool ID, outcome and duration.
- Page-range validation accepts valid ranges and rejects invalid ones.
- 77 actual application-handler executions: merge, extract, add text, typed signature, rotation, numbering and reversal across ten generated PDFs, plus malformed-input rejection for each handler.
- Generated output PDFs reopen and have the expected page counts.

The test harness uses the installed pdf-lib and simulated DOM elements, NOT a real browser. Fixtures include one-page, five-page, mixed-size, rotated, blank, form, metadata, vector graphic and 50-page documents. They do not constitute the requested full 100-case core-tool browser matrix. Page-count checks do not establish visual fidelity or accurate text positioning.

Pending / NOT verified:
- Browser UI and real downloads on desktop and mobile.
- Camera capture, image rendering, OCR, target compression and redaction correctness.
- Password-protected and severely corrupted files.
- Network audit and dependency security review.
- Twenty human pilot testers and at least 90% unaided completion.
- Final operator identity/contact, privacy policy and terms review.
- Remote aggregate analytics, cross-device return-visit metrics.
- Public launch approval and indexing.

Private access and noindex are intentionally retained. The old cache-first service worker is retired; old PrivyPDF shell caches are cleared on activation. This removes cached app shells, not user documents. Full offline support is not claimed.
