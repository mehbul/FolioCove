# Security policy

FolioCove is a public beta browser PDF workspace. Documents are processed on the user's device; the application does not provide a document-upload endpoint. This architecture does not establish that every output is safe to share, or that the application has a security certification.

## Reporting status

Checked 8 October 2026: GitHub private vulnerability reporting is **enabled** for this repository. Use [Report a vulnerability](https://github.com/mehbul/FolioCove/security/advisories/new) for suspected security problems. A GitHub account is required. The report uses GitHub's private advisory workflow; it is not a public issue or a general support inbox.

Do not put exploit details, customer files, personal information, credentials, or secrets in a public issue. For a suspected security problem, preserve your original file and stop using the affected workflow. Submit the smallest synthetic reproduction through the private report channel; do not attach real documents or secrets even there. Describe the affected tool, browser/version, reproduction steps, impact, and expected versus actual behavior.

A verified private support email has not been configured. The security-report channel does not replace that pending general-contact option or establish a response-time commitment.

Ordinary non-sensitive failures can be reported through [GitHub Issues](https://github.com/mehbul/FolioCove/issues/new/choose) using synthetic examples. GitHub Issues is public and is not a private support inbox. An account is required to submit an issue.

## Supported scope

Report reproducible problems in the current public Pages beta or the current `main` source. Older snapshots are not maintained as separate support branches. Updates are deployed from verified source; use the latest public build before checking whether a known problem persists.

Useful non-sensitive reproduction information includes the tool name, public URL, browser and operating-system versions, a minimal sequence of steps, the expected result, and a synthetic file's format and page count. Remove local paths, real filenames, document contents and identifiers from screenshots and logs. Never upload a real document for diagnosis.

## Known boundaries

- Redaction is experimental and requires independent output review.
- Verified sanitization and validated PDF/A are unavailable.
- Browser AI depends on browser support; model downloads are distinct from document uploads.
- Selected synthetic workflows have automated coverage. Physical phone cameras, native mobile download/open flows and Apple's Safari application remain unverified.
- This project does not operate a bug bounty or promise a response or remediation deadline.

The [tool limitations](https://mehbul.github.io/FolioCove/limitations/) describe current user-facing constraints. Maintainers should follow [the incident procedure](docs/OPERATIONS.md) when assessing a credible exposure or unexpected document transmission.
