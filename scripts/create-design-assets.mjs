import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

// Real synthetic PDF pages rendered to images; these are examples, not customer documents.
const out = path.resolve('src/static/previews');
await fs.mkdir(out, { recursive: true });
const examples = [
  ['proposal', 'PROJECT PROPOSAL', 'A fresh start.', 'Studio project / October 2026', ['The idea', 'A clear plan for the next chapter.', 'Thoughtful details. Room to explore.', 'The approach', 'Keep the work simple and useful.', 'Make space for what matters.']],
  ['invoice', 'SAMPLE INVOICE', 'Made with care.', 'Invoice 024 / Example only', ['Design consultation                 240.00', 'Document preparation                 80.00', 'Project review                       120.00', 'Total                                440.00', 'Thank you for your time.', 'All values are illustrative.']],
  ['notes', 'MEETING NOTES', 'Good things ahead.', 'Monday / Team workshop', ['A little structure', 'Bring the project into focus.', 'One idea at a time.', 'Next steps', 'Review the first draft.', 'Share feedback with the team.']],
  ['scan', 'DOCUMENT SCAN', 'Keep the details.', 'Synthetic document / Preview', ['A note worth keeping', 'Turn a photographed page into a PDF.', 'Find it again when you need it.', 'Check your result', 'Keep a copy of the original.', 'Inspect the downloaded document.']],
  ['signed', 'SAMPLE AGREEMENT', 'On the same page.', 'Project outline / Example only', ['The project', 'A simple outline of the work ahead.', 'Prepared for demonstration only.', 'Acknowledgement', 'Alex Morgan', 'Typed signature example.']]
];
for (const [name, label, title, meta, rows] of examples) {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([360, 470]);
  const ink = rgb(.14, .14, .14), muted = rgb(.43, .43, .43), coral = rgb(.78, .19, .26);
  page.drawText('FolioCove', { x: 30, y: 425, size: 11, font: bold, color: coral });
  page.drawText(label, { x: 30, y: 389, size: 7, font: bold, color: muted });
  page.drawText(title, { x: 30, y: 356, size: 24, font: bold, color: ink });
  page.drawText(meta, { x: 30, y: 334, size: 8, font: regular, color: muted });
  page.drawLine({ start: { x: 30, y: 315 }, end: { x: 330, y: 315 }, thickness: .6, color: rgb(.85, .85, .85) });
  rows.forEach((row, i) => page.drawText(row, { x: 30, y: 282 - i * 28, size: i === 0 || i === 3 ? 10 : 9, font: i === 0 || i === 3 ? bold : regular, color: ink }));
  page.drawText('SYNTHETIC EXAMPLE', { x: 30, y: 30, size: 6, font: regular, color: muted });
  page.drawText('01', { x: 315, y: 30, size: 7, font: regular, color: muted });
  const bytes = await doc.save();
  const task = pdfjs.getDocument({ data: bytes, standardFontDataUrl: `${path.resolve('node_modules/pdfjs-dist/standard_fonts')}/` });
  const pdf = await task.promise;
  const first = await pdf.getPage(1), viewport = first.getViewport({ scale: 1.5 });
  const canvas = createCanvas(viewport.width, viewport.height);
  await first.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  await fs.writeFile(path.join(out, `${name}.png`), canvas.toBuffer('image/png'));
  await task.destroy();
}
console.log('Rendered five synthetic PDF previews.');
