# FolioCove security and privacy audit

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 2 |
| Medium | 2 |
| Low | 2 |
| Informational | 1 |
| **Total** | **7** |

**Dependency audit:** 0 known vulnerable packages reported by the live npm advisory service. **Secrets scan:** 0 confirmed exposed credentials.

Date: 2026-09-22. Revision: `767ed87deed307d87d2f393c4134b9d0ffaecdc2`. Scope: the entire repository as a browser-only document-processing application, including all 74 tool handlers, generated distribution, dependencies, tests, service worker, build scripts, CI, and hosting configuration. Languages/frameworks: JavaScript ES modules, browser DOM/Canvas, Node.js build scripts, HTML/CSS, Playwright. Review followed the security-review skill, including its language, vulnerability, dependency, secrets, and report references.

**Release decision:** do not release the current cleanup and redaction features for sensitive documents. The downloaded “safe-to-share” PDF retains private information, and an invalid redaction page produces a successful-looking, unredacted download. Disable these operations or fix and independently verify them before a release offering those promises. This is an application-level audit with targeted runtime reproduction, not certification of every PDF parser or deployed hosting control.

Only audit reports and probe artifacts were added. Product source, generated product files, dependencies, and deployment settings were not changed by this audit.

## Evidence and verification

- [Reproduction script](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/docs/audits/security-probe.mjs) runs synthetic documents through the existing generated app in Chromium 153.0.8010.12. It intercepts and aborts any external requests, records attempted requests, and inspects downloaded output with pdf-lib.
- [Reproduction results](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/docs/audits/security-probe-results.json) include surviving XMP, field values, orphan action data, unsafe CSV text, invalid-page redaction success, HTML parsing behavior, and browser storage.
- [npm audit output](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/docs/audits/npm-audit.json) records the live result: 124 dependencies total, 83 production and 30 development classifications, with 38 optional entries counted by npm's overlapping categories; all advisory severity counts are zero. An initial sandbox-restricted network attempt failed; a subsequent authorized live query succeeded.
- Runtime probes used a dedicated loopback static server on port 4177 and a fresh temporary browser profile. Synthetic data only; no user's document was opened or uploaded.

Reproduce from the repository root: run `npm ci` and `npm run build` if necessary; start the dev server with `PORT=4177`; run `node docs/audits/security-probe.mjs`. On PowerShell set the server's port with `$env:PORT='4177'`. The probe writes its evidence JSON and closes the browser. It requires installed Playwright Chromium. Its blocked-network design records attempted external requests without allowing synthetic tracking requests to leave the machine.

## Data handling and confidentiality

### SEC-01 — HIGH: cleanup downloads retain recoverable private content

**Confidence: High.** Confirmed against downloaded output. **Release blocker:** yes for Privacy Inspector's sharing-copy operation and Sanitize, and for any broad claim that Clean metadata removes hidden metadata.

**Locations:** [index.mjs:68](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:68), [index.mjs:88](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:88), [index.mjs:89](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:89), [index.mjs:95](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:95). Source lines are long because the current handlers are compressed onto single lines.

Exact excerpts:

```js
function cleanMetadata(doc){doc.setTitle('');doc.setAuthor('');doc.setSubject('');doc.setKeywords([]);doc.setProducer('');doc.setCreator('')}
doc.catalog.delete(PDFName.of('OpenAction'));
doc.catalog.delete(PDFName.of('AA'));
doc.catalog.delete(PDFName.of('Names'));
pages.forEach(p=>{p.node.delete(PDFName.of('Annots'));p.node.delete(PDFName.of('AA'))});
download(await doc.save(),'safe-to-share.pdf')
```

**Data flow and risk:** local input PDF → original pdf-lib object context → a handful of dictionary entries removed or cleared → the same document context serialized → recipient receives supposedly cleaned output. The cleanup does not remove catalog `/Metadata` XMP or `/AcroForm` field data, and deleting references does not remove the referenced indirect objects from serialization. A recipient can recover sensitive values even when visible form annotations or automatic-action references have disappeared. This is output confidentiality loss, not proof that removed actions still automatically execute.

**Reproduction:** the probe creates one PDF containing public visible text, an author, catalog XMP with `PRIVATE_XMP_MARKER`, a text field containing `PRIVATE_FORM_MARKER`, and an OpenAction object containing `PRIVATE_ACTION_MARKER`. Both Privacy Inspector and Sanitize return success and clear the ordinary author string. In each output, the catalog XMP and private form value remain, and the detached action object can still be found by enumerating saved indirect objects. Clean metadata also leaves catalog XMP. Retaining fields/actions in the narrowly named Clean metadata operation is not itself a finding; retaining hidden XMP conflicts with a broad metadata-removal expectation.

**Exploitability:** no attacker foothold or script execution is required. A user trying to remove their own private information shares the misleading output; a recipient extracts it. An attacker can also deliberately place private markers in uninspected PDF structures. Existing warnings in [launch.mjs:15](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/launch.mjs:15) correctly say cleanup is incomplete, but the default sharing-copy checkbox, filename, and completion message continue to promise a sanitized artifact.

**Fix:** immediately disable secure-sharing downloads or present this strictly as limited dictionary editing with a neutral filename, while preserving read-only inspection. A verified sanitizer must specify whether visible filled form text is preserved or removed; construct a fresh, constrained output and copy only the approved representation, or implement reviewed object-graph garbage collection and comprehensive removal rules. Include document/page XMP, information dictionaries, forms/XFA, attachments, named resources, annotations, actions, optional layers, structure-tree alternate text, and unreachable objects in the threat model. Simply deleting additional catalog keys is not an adequate fix for residual indirect objects. Rasterization into a newly created PDF is a possible constrained output mode, with its visual-fidelity and accessibility losses explicitly disclosed; it still needs an output-level audit.

**Acceptance tests:** seed each hidden-data structure with independent markers; run each advertised cleanup path, including workflow cleanup; inspect decoded streams and all indirect objects using an independent implementation; ensure forbidden markers and structures are absent. Test original dates/custom Info keys, catalog/page metadata, field values and appearance streams, embedded files, page actions, and detached objects. Read-only inspection must not manufacture a sharing guarantee.

### SEC-02 — HIGH: out-of-range redaction page silently produces an unredacted success download

**Confidence: High.** Source path and browser reproduction confirmed. **Release blocker:** yes for redaction offered for sensitive data.

**Locations:** [index.mjs:35](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:35), [index.mjs:107](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:107), [launch.mjs:60](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/launch.mjs:60).

```html
<input id="redact-page" type="number" min="1" value="1">
```

```js
if(current==='redact'&&i===Math.max(1,+$('redact-page').value||1)){
  ctx.fillStyle='#000';
  ctx.fillRect(/* selected percentage rectangle */)
}
download(await out.save(),current==='redact'?'securely-redacted.pdf':'searchable-ocr.pdf')
```

The numeric input has no document-dependent maximum. The generic validity check only enforces its HTML constraints. The PDF rendering loop applies a rectangle only when it happens to encounter the requested page; it does not reject a nonexistent page or verify that a rectangle was applied.

**Reproduction:** select Redact, enter page `99`, and process a one-page PDF. The application reports “Done” and downloads `securely-redacted.pdf`. No iteration can satisfy `i===99`, so the PDF is rasterized without any redaction. This is more serious than missing searchable text: sensitive visible content remains readable and can be OCRed by a recipient.

**Exploitability:** ordinary user error suffices. A recipient receives the original visible content despite a reassuring filename. The general experimental warning does not correct this deterministic failure. This is not a claim that the valid-page raster pipeline preserves original hidden text; that path creates a new PDF and must be assessed separately.

**Fix:** after loading the PDF, validate an integer target page within `1..pdf.numPages`, validate a nonempty rectangle within page bounds, and capture the validated values once before rendering. Reject invalid input before creating a download. Track the number of applied rectangles and assert the expected count before output. Add a preview/confirmation of the actual region for a sensitive-document release.

**Acceptance tests:** `0`, `-1`, fractional, empty, NaN, page-count+1, and very large values must error without a download. Test boundary rectangles and rotated/cropped page geometry. For valid redactions compare the pixels in the selected region and independently extract/OCR output; text-extraction absence alone does not establish visual removal.

## Injection and file handling

### SEC-03 — MEDIUM: CSV exports allow spreadsheet formula interpretation

**Confidence: High** for emitted unsafe CSV; **Medium** for particular downstream exploitation, which depends on the recipient's spreadsheet application and settings. **Release blocker:** address before enabling CSV export for untrusted documents, or disable the affected export.

**Locations:** [index.mjs:105](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:105) and [index.mjs:92](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:92).

```js
`${i+1},"${line.replaceAll('"','""')}"`
...emails.map(x=>`Email,"${x}"`)
...phones.map(x=>`Phone,"${x.trim()}"`)
...urls.map(x=>`URL,"${x}"`)
```

**Data flow:** attacker-controlled selectable PDF text → `extractPdfText()` → quoted CSV field → spreadsheet opened by a user. CSV quoting protects separators but does not force a field to be treated as text. The browser probe converted a PDF containing `=1+1` into exactly `Page,Line\n1,"=1+1"`. No spreadsheet was launched and no malicious formula was executed during this audit.

Contacts export uses a separate CSV construction path with no quote escaping. Extracted URL text can contain `"`, leading to malformed CSV, and email addresses can begin with `+` or `-`; these are additional inputs that require a common safe exporter. A `+` phone number may be interpreted as a numeric/formula value and lose its original representation even without a malicious payload.

**Risk and exploitability:** the user must open the download in a formula-evaluating spreadsheet. Formula behavior may alter values, display attacker-controlled links, or access external resources where the spreadsheet permits it. Remote code execution is not established here. [OWASP's CSV Injection guidance](https://community.owasp.org/attacks/CSV_Injection) documents the formula boundary and warns that no CSV escaping scheme works identically for every consumer.

**Fix:** prefer a true XLSX export with every imported PDF/contact value explicitly written as a string cell and no formula or external-link properties. If retaining CSV, define supported consumers, escape all quotes/separators correctly, neutralize formula/control-character prefixes with a tested text-preserving policy, and disclose any inserted prefix. Use one helper across both export paths. Verify save/reopen behavior in supported Excel and LibreOffice versions; do not assume quoting alone is sufficient.

### SEC-04 — MEDIUM: resource controls run after automatic parsing and do not limit decoded work

**Confidence: High** for the missing controls; **Medium** for device-specific exhaustion impact. **Release blocker:** not on its own for a restricted synthetic beta, but required before treating arbitrary untrusted documents as supported.

**Locations:** [index.mjs:40](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:40), [index.mjs:47](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:47), [index.mjs:55](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:55), [index.mjs:77](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:77), [index.mjs:79](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:79), [index.mjs:87](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:87), [index.mjs:106](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:106), [launch.mjs:62](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/launch.mjs:62).

```js
if(current==='visualorganize'&&selected[0]){
  organizer=null;renderOrganizer(selected[0]) /* ... */
}
const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
canvas.width=viewport.width;canvas.height=viewport.height;
```

The 100 MB check is attached to the Run button, while selecting a Visual organizer file starts full parsing and page-thumbnail rendering immediately. Multiple-file tools have no aggregate byte/count limit. PDF page count, decoded image dimensions, canvas pixel count, archive entry count/uncompressed size, and total operation cost have no application budgets. A small compressed file can demand far more memory than its stored size suggests.

Most PDF.js users also omit `destroy()`; organizer is the exception at line 62. `rasterPdf()` is invoked up to five times by target compression at line 86 without releasing its PDF worker/document each time. Camera image bitmaps are not explicitly closed. These amplify memory pressure across repeated operations; no quantitative heap-leak rate was measured.

**Risk and exploitability:** a user opens an attacker-supplied PDF, image, or Office/EPUB ZIP; processing can freeze or terminate the local tab, losing pending work. This is client availability risk, not a remote shared-server denial of service. No destructive giant-file test was run.

**Fix:** enforce file size/count/aggregate checks in the common admission function before preview work; validate page count and finite bounded page/image dimensions before allocation; cap per-page and total rendered pixels; reject oversized/deep archives before unbounded extraction. Move suitable CPU-heavy work into cancellable workers, release PDF.js documents/tasks in `finally`, close bitmaps, and release canvas backing stores. Maintain defined desktop/mobile budgets and clear errors. Test boundary fixtures just above limits instead of deliberately crashing browsers.

## Browser and build controls

### SEC-05 — LOW: repository does not define browser security headers or a content policy

**Confidence: High** for repository/local-server behavior; **Medium** for deployed behavior, because the hosting platform may independently add headers. **Release blocker:** production header/access verification remains a release verification task, not a proven production vulnerability.

**Locations:** [home.html:3](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/pages/home.html:3), [dev-server.mjs:45](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/scripts/dev-server.mjs:45), [.openai/hosting.json:3](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/.openai/hosting.json:3).

```js
response.writeHead(200, {'content-type': types.get(ext) || 'application/octet-stream'});
```

The HTML has no CSP meta policy, the local server only sets Content-Type, and hosting configuration only chooses `dist/`. There is no versioned CSP, frame-ancestor rule, nosniff header, Referrer-Policy, or Permissions-Policy. This is missing defense in depth, not evidence of a current DOM XSS exploit. A code-injection or compromised-bundle defect would have broad network options from a page that can access selected documents.

**Fix:** define and verify platform response headers. Start CSP in report-only mode during compatibility testing, then enforce: tightly scoped local scripts/workers, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, and appropriate image/font/connect restrictions. Account explicitly for local WASM, blob workers, OCR model GETs, and current inline styles. Prefer extracting inline styles or using hashes rather than blanket script exceptions. Set nosniff, a suitable Referrer-Policy, and least-privilege Permissions-Policy. Verify HTTPS and authenticated app/asset responses at the deployed host, including cache and logout behavior. Do not infer access control from `noindex,nofollow`.

### SEC-06 — LOW: CI relies on mutable action tags and has no recurring advisory gate

**Confidence: High.** **Release blocker:** no current vulnerable dependency was found; this is preventive maintenance.

**Locations:** [.github/workflows/ci.yml:12](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/.github/workflows/ci.yml:12), [.github/workflows/ci.yml:15](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/.github/workflows/ci.yml:15), [.github/workflows/ci.yml:20](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/.github/workflows/ci.yml:20).

```yaml
uses: actions/checkout@v4
uses: actions/setup-node@v4
```

CI installs the lockfile and runs build, bundle checks, and Chromium tests. There is no npm advisory check, scheduled dependency review, or explicit `permissions: contents: read` declaration. Action tags can be retargeted; effective token permissions depend on repository defaults not available in this review. No compromised action or excessive effective permission was observed.

**Fix:** pin trusted actions to reviewed full commit SHAs with a controlled update mechanism; explicitly grant read-only default token permissions; add a dependency/advisory review that handles service failure distinctly from “zero vulnerabilities.” Include generated runtime assets in release checks and make dependency updates reproduce the build. Preserve the present exact direct pins and lockfile integrity hashes.

### SEC-07 — INFO: HTML import has a cross-browser network-verification gap

**Confidence: Medium** as a compatibility/privacy verification gap; **not a confirmed exploit**. **Release blocker:** verify supported browser behavior before promising zero document-triggered external requests for HTML imports.

**Location:** [index.mjs:106](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/index.mjs:106).

```js
new DOMParser().parseFromString(raw,'text/html').body.innerText
```

Parsed HTML is never inserted into the live page, and the browser probe confirmed that embedded script did not execute. Synthetic remote image/iframe URLs produced no request attempts in Chromium 153 during this path. Do not classify the mere presence of DOMParser as confirmed XSS. However, [MDN's API documentation](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString) notes that inert HTML documents may download certain embedded resources; this runtime behavior should not be assumed across all supported browsers.

**Action:** add dedicated HTML fixtures with image, iframe, stylesheet, CSS URL, base, SVG, srcset, and refresh references to the browser network matrix. Prefer a text parser with no browsing/network context if cross-browser tests cannot establish the required boundary. Network prevention must cover resource loads, not only explicit `fetch()` calls.

## Dependency, secrets, and architecture review

**Dependencies.** Direct production pins are `@e965/xlsx@0.20.3`, `jszip@3.10.1`, `mammoth@1.12.3`, `pdf-lib@1.17.1`, `pdfjs-dist@6.3.289`, `qrcode@1.5.4`, `read-excel-file@9.3.10`, and `tesseract.js@5.1.1`; dev pins are Playwright 1.63.0 and esbuild 0.25.10. The manifest and lockfile agree on exact direct versions. npm's successful live advisory response reported no known vulnerabilities. This does not establish absence of unpublished parser or supply-chain vulnerabilities; no package is flagged solely for age or because a similarly named package had a historical CVE.

Build review confirmed that PDF.js worker and decoder assets and Tesseract JavaScript/WASM are copied into local site assets. The build replaces known CDN default strings, and the static tests check selected blocked CDN/upload strings. Replacement strings and marker scans are not substitutes for observing browser/worker network behavior.

**Secrets.** Scanned first-party source/configuration, tests, docs, hidden CI/hosting configuration, manifest/lockfile, and generated text assets for credential assignments, tokens, private keys, connection strings, and environment-file exposure. No credential-bearing `.env`, key, or service-account file was found in the tracked file list. `.env` and `.env.*` are ignored. The hosting project identifier is a public identifier, not an authentication secret. Two AWS-shaped matches inside Tesseract's embedded WASM base64 were checked and rejected as binary-data coincidences. No actual secret value is included in this report. The deployment tar's entry list contains generated distribution files and hosting metadata; it was not used as a source of credentials. Full historical Git object scanning and binary reverse engineering were not performed, so this is not an attestation that every prior commit or binary can contain no secret.

**Source-to-sink trace.** File picker/drop → `add()` MIME/extension checks → browser File/ArrayBuffer → pdf-lib/PDF.js/Office/archive parser → Canvas/text/structured objects → local Blob URL/download. Filenames use `textContent`, document inspection/error output uses `textContent`, workflow names use `.value`/`textContent`, and Word-compatible HTML export escapes ampersands and less-than signs. The reviewed ordinary document-content paths do not flow into live `innerHTML`. Dynamic tool markup is primarily fixed configuration; recent tool IDs are filtered through the configuration map. No exploitable document-to-DOM XSS was confirmed.

There is no application database, account API, session issuer, payment backend, or document-upload route; SQL injection, application IDOR, server-side upload traversal, and session CSRF do not apply to this static application architecture. Authentication is a hosting responsibility and was not proven by repository inspection. The dev server confines requested paths using `path.relative()` and binds loopback by default. Its externally configurable `HOST` option does not make it a production authentication server. ZIP entry names are read in memory rather than written as filesystem paths; the reviewed extraction paths do not expose a host-filesystem Zip Slip sink. Browser XML parsing is not equivalent to Node/server XML parsing, and no local-file XXE path was identified.

**Network and local storage.** The one explicit application `fetch()` at index.mjs:98 reads a QR `data:` URL; it does not fetch the user-entered QR destination. OCR configuration at index.mjs:5 allows English model requests to `https://tessdata.projectnaptha.com/4.0.0`; translation at line 105 uses the browser Translator API. Both are disclosed. No remote analytics, beacon, WebSocket, document-upload endpoint, or arbitrary input-to-HTTP upload was identified. The probe's non-OCR workflows produced no attempted external requests. It did not rerun OCR or Translator model downloads, and browser-internal translation traffic is not necessarily visible to page-level hooks.

Local storage contains favorite/recent tool identifiers, a user-named workflow, and optional metrics. Metrics contain tool/outcome/duration, omit document content and filenames, and cap at 1,000 entries ([launch.mjs:33](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/app/launch.mjs:33), line 48). They are off by default. A user-entered workflow name could itself contain sensitive information; it is local storage, not a transmitted analytics payload. Selected files and outputs remain in process memory/downloads, and are not guaranteed securely erased by JavaScript garbage collection.

The service worker is network-only and deletes old `privypdf-shell-` caches on activation ([sw.js:1](C:/Users/Mehbul%20Islam/Documents/ChatGPT/pdf/src/static/sw.js:1)); it does not cache uploaded documents or add an offline app cache. This does not control the host's HTTP cache headers. Hosting authentication, authenticated asset cacheability, CDN logs/retention, logout behavior, and public/private deployment status require separate live verification.

## Proposed high-severity patches — review only

**Review each patch before applying. Nothing has been changed yet.** This statement refers to product code; the audit artifacts themselves have been created. The following are proposed containment changes, not an implementation of a universal sanitizer.

### SEC-01 containment

Before, Privacy Inspector allows dictionary cleanup followed by a sharing-labelled download:

```js
if($('make-safe').checked){cleanMetadata(doc); /* selected dictionary deletions */
  download(await doc.save(),'safe-to-share.pdf')}
```

After, insert the following guard at the beginning of that operation, before cleanup/output:

```js
if ($('make-safe').checked) {
  // Block sharing downloads until hidden-data removal is independently verified.
  throw Error('Secure cleanup is unavailable. Uncheck the sharing-copy option to inspect this PDF.');
}
```

Before, Sanitize deletes selected keys and saves the original context. Replace its branch with:

```js
if (current === 'sanitize') {
  // Dictionary deletion does not erase recoverable private PDF objects.
  throw Error('Secure sanitization is unavailable pending output verification.');
}
```

Set Privacy Inspector's sharing checkbox to unchecked/disabled with an explanation; neutralize workflow/cleanup sharing claims, and label Clean metadata as clearing specified standard Info fields only. A tested fresh-output sanitizer can replace these guards later. Do not ship a patch that merely removes `/Metadata` and declares the entire output safe.

### SEC-02 page and region validation

Before:

```js
if(current==='redact'&&i===Math.max(1,+$('redact-page').value||1)){
  ctx.fillStyle='#000';ctx.fillRect(/* values read directly from fields */)
}
```

After, immediately after the PDF is loaded and before rendering:

```js
let redaction = null;
if (current === 'redact') {
  const pageNumber = Number($('redact-page').value);
  const x = Number($('redact-x').value), y = Number($('redact-y').value);
  const width = Number($('redact-w').value), height = Number($('redact-h').value);
  // Reject a no-op or out-of-bounds redaction before any download can be produced.
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > pdf.numPages)
    throw Error(`Choose a page between 1 and ${pdf.numPages}.`);
  if (![x, y, width, height].every(Number.isFinite) || x < 0 || y < 0 ||
      width <= 0 || height <= 0 || x + width > 100 || y + height > 100)
    throw Error('Choose a nonempty redaction region entirely inside the page.');
  redaction = {pageNumber, x, y, width, height};
}
let redactionsApplied = 0;
```

Replace the loop's conditional rectangle with:

```js
if (redaction && i === redaction.pageNumber) {
  ctx.fillStyle = '#000';
  ctx.fillRect(canvas.width * redaction.x / 100, canvas.height * redaction.y / 100,
    canvas.width * redaction.width / 100, canvas.height * redaction.height / 100);
  redactionsApplied++;
}
```

Immediately before saving/downloading:

```js
// Fail closed if the requested operation was not actually applied.
if (redaction && redactionsApplied !== 1) throw Error('Redaction was not applied; no output created.');
```

Keep validation and PDF task cleanup inside a `try/finally`; keep OCR's separate worker termination. Validate the modified valid-page path visually and through independent output inspection before removing the release block.

## Coverage and remaining release verification

The repository contains 60 tracked files at this revision. All first-party source, scripts, policy pages, CI/hosting configuration, and existing test logic were reviewed; generated source locations were traced to source, generated assets were scanned, and direct/transitive dependencies were audited. Bundled third-party source and WASM were not exhaustively reverse engineered line by line. Large compressed single-line application handlers make an aggregate “lines audited” count misleading, so no inflated line-count claim is made.

Completed here: live dependency audit; scoped secrets/exposure scan; complete first-party source/data-flow review; targeted browser confirmation of cleanup, CSV, invalid-page redaction, and HTML/network behavior; deployment/build/service-worker configuration review. Existing E2E/static tests were inspected for coverage, not represented as newly executed by this audit. No current malicious-PDF parser RCE, document-to-DOM XSS, uploaded-document exfiltration, exposed credential, or vulnerable dependency was confirmed.

Before sensitive-document release: resolve SEC-01 and SEC-02, address or disable unsafe CSV exports, and apply defined resource budgets. Re-run output-security tests with an independent parser/renderer, including rotated/cropped pages and hidden PDF structures. Verify request/worker/service-worker behavior in Chrome, Edge, Safari, Android and iOS, including OCR and supported translation. Inspect real deployed response headers, host access control, caches, logs/retention and logout behavior. Keep the current synthetic/non-sensitive beta restriction until those gates have evidence.
