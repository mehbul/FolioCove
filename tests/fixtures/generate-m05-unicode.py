"""Regenerate the synthetic M05 Unicode-font PDF (ReportLab 4.4.9)."""

from hashlib import sha256
from pathlib import Path

from reportlab import Version as reportlab_version
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[2]
FONT = ROOT / "node_modules/pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf"
OUTPUT = Path(__file__).with_name("pvp-m05-unicode.pdf")
FONT_SHA256 = "f8ace1f892b2bd9dc1792ba7f097fa7588f84fed48321480e04de5390828221f"

if reportlab_version != '4.4.9':
    raise RuntimeError(f'Expected ReportLab 4.4.9, got {reportlab_version}')
if sha256(FONT.read_bytes()).hexdigest() != FONT_SHA256:
    raise RuntimeError('Unicode font source changed')
pdfmetrics.registerFont(TTFont("M05LiberationSans", str(FONT)))

pdf = canvas.Canvas(str(OUTPUT), pagesize=(540, 400), pageCompression=1, invariant=1)
pdf.setTitle("M05 synthetic Unicode font fixture")
pdf.setAuthor("FolioCove validation")
pdf.setFillColorRGB(0.04, 0.08, 0.13)
pdf.setFont("M05LiberationSans", 42)
pdf.drawString(54, 248, "Ω λ Ж Д")
pdf.showPage()
pdf.save()

print(f"{OUTPUT.name} sha256={sha256(OUTPUT.read_bytes()).hexdigest()}")
