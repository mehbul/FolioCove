# Dependency and workflow maintenance

The owner requested resolution of project issues on 17 October 2026. The current GitHub issue queue, FolioCove support search and published showcase comments contained no reported application defects. The completed main and beta-tag workflows passed; their annotations and a fresh dependency audit identified the actionable maintenance problems below.

## Findings and fixes

1. `npm audit --omit=dev --audit-level=moderate` failed with three moderate advisories through `mammoth → argparse 1 → sprintf-js` ([GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c)). This dependency finding does not demonstrate an exploit in the browser application. The suggested forced fix would downgrade Mammoth to an old incompatible version. A scoped `mammoth.argparse` override pins 2.0.1, which removes `sprintf-js`. The lockfile retains Mammoth 1.12.3 and records the parser's integrity and Python-2.0 license.
2. Checkout/setup actions used deprecated Node 20 runtimes, and `ubuntu-latest` announced an imminent image migration. Both workflows now use `ubuntu-24.04` and verified official Node 24 action releases: checkout 7.0.1, setup-node 7.1.0, configure-pages 6.0.0, upload-pages-artifact 5.0.0 and deploy-pages 5.0.1. Existing job permissions and deployment audience are preserved.
3. Both workflows now fail on moderate-or-higher production dependency advisories instead of merely printing npm's informational audit summary during installation.

Remove or revisit the scoped parser override when Mammoth's upstream dependency chain is repaired. Its legacy CLI remains functional but emits upstream deprecated-option warnings with argparse 2; FolioCove does not invoke that CLI in the browser.

## Local verification

- Before the override, the moderate-threshold production audit exited 1; afterward it reported zero vulnerabilities.
- A generated synthetic DOCX converted successfully through both Mammoth's library API and actual legacy CLI. CLI help also passed.
- Build, 77 generated-bundle handler cases and AI-readiness checks passed.
- The Pages build and all 28 Pages browser checks passed, including DOCX-to-PDF conversion, known sample outputs and support pages.
- The ordinary root build was restored before staging generated output.

Hosted workflow success must be confirmed from this commit's completed CI and Pages runs. Physical phone capture/native-download/Safari checks, human pilot evidence and finalized public-business notices remain separate outstanding gates. This work does not enable unavailable sanitization, PDF/A or universal browser AI, and does not establish an independent security certification.
