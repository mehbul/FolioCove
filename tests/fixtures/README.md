# Synthetic M05 Unicode-font fixture

`pvp-m05-unicode.pdf` is a one-page, 540 x 400 pt PDF containing only the synthetic glyph string `Ω λ Ж Д`. Its TrueType font is embedded and subsetted. It contains no user document or personal data.

The source font is `node_modules/pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf` from the project's locked `pdfjs-dist@6.3.289` installation. Its SHA-256 is `f8ace1f892b2bd9dc1792ba7f097fa7588f84fed48321480e04de5390828221f`. The generator checks this hash before use. The font license is distributed beside it at `node_modules/pdfjs-dist/standard_fonts/LICENSE_LIBERATION` (Red Hat Liberation font software, GPL v2 with a document-embedding exception). The generated PDF's SHA-256 is `a79dbd29551f2d138c6b3a49df77997d66cb120652931f9729801ab3759e00f5`; the M05 test checks it before upload.

Regenerate after `npm ci` with Python and ReportLab 4.4.9:

```powershell
python tests/fixtures/generate-m05-unicode.py
```

The script uses ReportLab's `invariant=1` output mode. Two consecutive runs with the bundled Python/ReportLab 4.4.9 and the verified source font produced the same PDF hash. The PDF was visually inspected with Poppler and independently parsed/rendered in the M05 test with PDF.js. The ASCII companion is generated at test time with `pdf-lib`.
