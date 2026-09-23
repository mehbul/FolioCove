# M05 validation report

Date: 2026-09-23

Branch: `codex/validation-m05`

Case: M05 only

Result: PASS in bundled Chromium. The merged Unicode glyph region is visually unchanged, the ASCII page marker extracts, and no font error was observed.

## Scope and fixture provenance

This change adds only M05 to `tests/e2e/validation/merge.spec.mjs`, with a committed synthetic Unicode-font PDF, its deterministic generator, and `tests/fixtures/README.md`. It makes no product-code, dependency, shared-helper, script, CI, or other-case changes. The ASCII companion is generated at test time with `pdf-lib`; the output download stays in the temporary test directory. No user data is used.

The Unicode PDF is one 540 x 400 pt page with `Ω λ Ж Д` drawn in an embedded subset of Liberation Sans. ReportLab 4.4.9 generates it with `invariant=1` from the locked `pdfjs-dist@6.3.289` font `standard_fonts/LiberationSans-Regular.ttf`. The source font SHA-256 is `f8ace1f892b2bd9dc1792ba7f097fa7588f84fed48321480e04de5390828221f`. The PDF SHA-256 is `a79dbd29551f2d138c6b3a49df77997d66cb120652931f9729801ab3759e00f5`. The generator verifies the former and the test verifies the latter. Two consecutive generations produced the same PDF hash. The font's bundled license is `standard_fonts/LICENSE_LIBERATION`, which includes its document-embedding exception. The source PDF was also visually inspected after Poppler rendering.

## Browser and output evidence

The existing page/network guards are installed before navigation and check uncaught errors, unapproved requests, and leakage of synthetic markers or filenames. The test checks the merge route title, private-beta notice, PDF-only input, and `noindex,nofollow`. It requires one `merged.pdf` download, positive status, an enabled run button afterward, and processing within 20 seconds. Browser console font errors are collected and required to be empty.

Before upload, `pdf-lib` and PDF.js independently open the Unicode source and ASCII companion. PDF.js renders with system font fallback disabled. The Unicode source has an embedded TrueType font descriptor, extracts the exact glyph string, and has a nonblank fixed glyph region. After merge, both parsers open exactly two pages in input order. The output retains an embedded font descriptor, extracts `Ω λ Ж Д` only on page 1, and extracts `PVP-M05-ASCII` only on page 2. Both output page dimensions match their sources.

The fixed glyph region's source and output dark-pixel ratios are both `0.0443205574912892`. The source and output glyph region bytes are required to match exactly, with no channel or pixel tolerance. This directly checks the source/output render match and guards against a blank or substituted Unicode region. The browser reported zero font console errors. PDF.js Node warnings and errors are captured during each source and output parse/render, with warning verbosity enabled and system font fallback disabled; all three diagnostic lists were empty. The existing page/network guards reported zero violations. The test attaches four source/output PNG renders and JSON oracle data. The merged download was 28,406 bytes; its status was `Done — your private download is ready.` and processing took 76 ms in the JSON evidence run.

## Commands and result

- `npm run build` — PASS; generated 10 tool routes and 5 beta information pages.
- `npx playwright test tests/e2e/validation/merge.spec.mjs --project=chromium --grep M05 --reporter=list` — PASS, 1/1; 861 ms test body, 3.6 s command.
- Same focused Chromium command with `--reporter=json` — PASS, 1/1; supplied the numeric oracle values above.
- `npm test` — PASS; syntax, routes, schema, page-range and spreadsheet regressions, and 77 generated-bundle handler executions.

## Coverage limit

This case covers the bundled Chromium project and Node PDF.js rendering. It does not claim installed Chrome, Edge, mobile, or other validation matrix rows. No M05 product defect was observed.

## Review hardening

The M05 oracle now compares every RGB channel in the rendered glyph region exactly. It records source and output region SHA-256 values and requires byte equality; the earlier 20-channel/1%-pixel tolerance has been removed from this case. Source Unicode, source ASCII, and merged output PDF.js warnings/errors are captured and must each be empty. The fixture generator now rejects any ReportLab version other than 4.4.9 before writing a PDF. The review rerun passed: source and output region SHA-256 were both `4e54e510d82660949421a7ece29b41b64767e91a0eb14c9a2bbcf00b45118361`, `glyphPixelsIdentical` was `true`, and all three PDF.js diagnostic lists were empty. The focused Chromium test passed 1/1, the fixture regenerated to its recorded checksum, and `npm run build` and `npm test` both passed.
