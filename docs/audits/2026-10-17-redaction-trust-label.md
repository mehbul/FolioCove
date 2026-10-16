# Experimental redaction label and operating-note correction

The catalog, workspace and static sidebar previously called an experimental feature Secure redact. That wording could imply a security assurance not established by the scoped synthetic checks. The label is now Redact region, the description explicitly says experimental and requires independent output review, and the static sidebar uses an Experimental badge. Tool ID, output name, processing behavior and local preferences remain stable.

The direct-route regression check first failed on the old title, then passed on the new label. It also checks that the experimental description and limit warning are visible before file selection while processing is disabled. The existing synthetic test verifies one rasterized region and absence of a target text marker; invalid page/region inputs still produce no download. These tests do not establish secure sanitization or accuracy for arbitrary sensitive documents.

Validation: required build, 77 handler cases and all 88 AI-readable catalog entries passed. Three focused redaction browser tests passed, followed by the strengthened pre-processing-warning check. All 21 Pages browser checks passed. Deployment and live changed-page verification must be confirmed separately from local checks.

Operating notes now acknowledge the actual active six-hour discovery heartbeat without calling it uptime or security supervision. The historical mobile/Safari pilot guide points to the public beta without requiring app sign-in, while preserving the uncompleted physical-device, native-download and Safari-app gates. General-support email and finalized business notices remain pending. No completed phone testing, certification, user counts or ranking gains are claimed.
