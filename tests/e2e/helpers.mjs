import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const standardFontDataUrl = 'node_modules/pdfjs-dist/standard_fonts/';
const wasmUrl = 'node_modules/pdfjs-dist/wasm/';

export const uniqueMarker = 'PRIVYPDF_E2E_MARKER_74291';
export const fixtureFilename = 'privypdf-e2e-marker-74291.pdf';

export async function makeFixtureDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'privypdf-e2e-'));
}

export async function createPdf(filePath, pageTexts, options = {}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  if (options.metadata) {
    doc.setTitle(options.metadata.title || 'PrivyPDF E2E Title');
    doc.setAuthor(options.metadata.author || 'PrivyPDF E2E Author');
    doc.setSubject(options.metadata.subject || 'PrivyPDF E2E Subject');
    doc.setKeywords(options.metadata.keywords || ['privypdf', 'e2e']);
  }
  for (let i = 0; i < pageTexts.length; i++) {
    const page = doc.addPage([420, 540]);
    page.drawText(`Fixture page ${i + 1}`, { x: 40, y: 488, size: 18, font: bold, color: rgb(0.05, 0.1, 0.18) });
    page.drawText(pageTexts[i], { x: 40, y: 440, size: 13, font, color: rgb(0.08, 0.1, 0.13) });
    page.drawText(uniqueMarker, { x: 40, y: 410, size: 8, font, color: rgb(0.25, 0.25, 0.25) });
    if (options.redactionTarget && i === 0) {
      page.drawText(options.redactionTarget, { x: 42, y: 300, size: 20, font: bold, color: rgb(0.02, 0.02, 0.02) });
    }
  }
  await fs.writeFile(filePath, await doc.save());
  return filePath;
}

export async function createMalformedPdf(filePath) {
  await fs.writeFile(filePath, Buffer.from('%PDF-1.7\nthis is intentionally truncated\n'));
  return filePath;
}

function packBits(bitString) {
  const bytes = [];
  for (let offset = 0; offset < bitString.length; offset += 8) {
    const chunk = bitString.slice(offset, offset + 8).padEnd(8, '0');
    bytes.push(Number.parseInt(chunk, 2));
  }
  return Buffer.from(bytes);
}

function pdfObject(id, body) {
  return Buffer.from(`${id} 0 obj\n${body}\nendobj\n`, 'binary');
}

function pdfStreamObject(id, dictionary, stream) {
  return Buffer.concat([
    Buffer.from(`${id} 0 obj\n<< ${dictionary} /Length ${stream.length} >>\nstream\n`, 'binary'),
    stream,
    Buffer.from('\nendstream\nendobj\n', 'binary')
  ]);
}

function assemblePdf(objects) {
  const chunks = [Buffer.from('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n', 'binary')];
  const offsets = [0];
  for (const object of objects) {
    offsets.push(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
    chunks.push(object);
  }
  const xrefOffset = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const xref = [`xref\n0 ${objects.length + 1}`, '0000000000 65535 f ', ...offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n `)].join('\n');
  chunks.push(Buffer.from(`${xref}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`, 'binary'));
  return Buffer.concat(chunks);
}

export async function createCcittScanPdf(filePath) {
  const white16 = '101010';
  const white4 = '1011';
  const black8 = '000101';
  const rows = [];
  for (let y = 0; y < 16; y++) rows.push(y >= 4 && y < 12 ? `${white4}${black8}${white4}` : white16);
  const ccitt = packBits(rows.join(''));
  const content = Buffer.from('q\n320 0 0 320 70 240 cm\n/Im1 Do\nQ\n', 'binary');
  const objects = [
    pdfObject(1, '<< /Type /Catalog /Pages 2 0 R >>'),
    pdfObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    pdfObject(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 460 560] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>'),
    pdfStreamObject(4, '/Type /XObject /Subtype /Image /Width 16 /Height 16 /ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /CCITTFaxDecode /DecodeParms << /K 0 /Columns 16 /Rows 16 /BlackIs1 true /EndOfBlock false >>', ccitt),
    pdfStreamObject(5, '', content)
  ];
  await fs.writeFile(filePath, assemblePdf(objects));
  return filePath;
}

export async function createImageOnlyTextPdf(page, filePath, lines) {
  await page.setContent(`
    <!doctype html>
    <meta charset="utf-8">
    <style>
      body { margin: 0; background: #f7f7f2; }
      [data-testid="ocr-fixture"] {
        box-sizing: border-box;
        width: 1000px;
        min-height: 460px;
        padding: 72px 84px;
        background: #fffef8;
        color: #080808;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 58px;
        font-weight: 700;
        line-height: 1.34;
        letter-spacing: 1px;
        border: 18px solid #f0efe7;
      }
      p { margin: 0 0 36px; }
    </style>
    <main data-testid="ocr-fixture">${lines.map(line => `<p>${line}</p>`).join('')}</main>
  `);
  const png = await page.getByTestId('ocr-fixture').screenshot({ type: 'png' });
  const doc = await PDFDocument.create();
  const img = await doc.embedPng(png);
  const pageWidth = 612;
  const pageHeight = 792;
  const drawWidth = 520;
  const drawHeight = drawWidth * (img.height / img.width);
  const pdfPage = doc.addPage([pageWidth, pageHeight]);
  pdfPage.drawImage(img, { x: 46, y: pageHeight - drawHeight - 72, width: drawWidth, height: drawHeight });
  await fs.writeFile(filePath, await doc.save());
  return filePath;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])), 0);
  return Buffer.concat([length, name, data, crc]);
}

export async function createDocumentPhoto(filePath) {
  const width = 96;
  const height = 72;
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x++) {
      const inside = x > 18 && x < 78 && y > 14 && y < 58;
      const line = inside && ((y > 24 && y < 28) || (y > 36 && y < 40) || (x > 28 && x < 34 && y > 20 && y < 52));
      const v = inside ? (line ? 30 : 238) : 255;
      const i = 1 + x * 4;
      row[i] = v;
      row[i + 1] = v;
      row[i + 2] = v;
      row[i + 3] = 255;
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(Buffer.concat(rows))),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
  await fs.writeFile(filePath, png);
  return filePath;
}

export async function pdfPageCount(filePath) {
  const bytes = await fs.readFile(filePath);
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

export async function pdfText(filePath) {
  const bytes = await fs.readFile(filePath);
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes), standardFontDataUrl, wasmUrl });
  const pdf = await task.promise;
  try {
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const content = await (await pdf.getPage(i)).getTextContent();
      pages.push(content.items.map(item => item.str).join(' '));
    }
    return pages.join('\n');
  } finally {
    await task.destroy();
  }
}

export async function pdfMetadata(filePath) {
  const bytes = await fs.readFile(filePath);
  const doc = await PDFDocument.load(bytes);
  return { title: doc.getTitle(), author: doc.getAuthor(), subject: doc.getSubject(), keywords: doc.getKeywords() };
}

function paeth(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  if (aboveDistance <= upperLeftDistance) return above;
  return upperLeft;
}

function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) throw new Error('Not a PNG');
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[12] !== 0) throw new Error('Unsupported PNG encoding');
      colorType = data[9];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0;
  if (!channels) throw new Error(`Unsupported PNG color type ${colorType}`);
  const bytesPerPixel = channels;
  const stride = width * channels;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(stride * height);
  let source = 0;
  for (let y = 0; y < height; y++) {
    const filter = inflated[source++];
    const rowStart = y * stride;
    const priorStart = rowStart - stride;
    for (let x = 0; x < stride; x++) {
      const raw = inflated[source++];
      const left = x >= bytesPerPixel ? pixels[rowStart + x - bytesPerPixel] : 0;
      const above = y > 0 ? pixels[priorStart + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? pixels[priorStart + x - bytesPerPixel] : 0;
      let value = raw;
      if (filter === 1) value += left;
      else if (filter === 2) value += above;
      else if (filter === 3) value += Math.floor((left + above) / 2);
      else if (filter === 4) value += paeth(left, above, upperLeft);
      else if (filter !== 0) throw new Error(`Unsupported PNG filter ${filter}`);
      pixels[rowStart + x] = value & 0xff;
    }
  }
  return { width, height, channels, pixels };
}

export async function pngDarkPixelRatioFromZip(zipPath, entryName) {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await fs.readFile(zipPath));
  const entry = zip.file(entryName);
  if (!entry) throw new Error(`Missing ${entryName} in PNG ZIP`);
  const png = Buffer.from(await entry.async('uint8array'));
  const { width, height, channels, pixels } = decodePng(png);
  let dark = 0;
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = channels === 1 ? r : pixels[i + 1];
    const b = channels === 1 ? r : pixels[i + 2];
    if (r < 220 || g < 220 || b < 220) dark++;
  }
  return dark / (width * height);
}

export async function pngRegionBlackPixelRatioFromZip(zipPath, entryName, region) {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await fs.readFile(zipPath));
  const entry = zip.file(entryName);
  if (!entry) throw new Error(`Missing ${entryName} in PNG ZIP`);
  const png = Buffer.from(await entry.async('uint8array'));
  const { width, height, channels, pixels } = decodePng(png);
  const left = Math.max(0, Math.floor(width * region.x));
  const top = Math.max(0, Math.floor(height * region.y));
  const right = Math.min(width, Math.ceil(width * (region.x + region.width)));
  const bottom = Math.min(height, Math.ceil(height * (region.y + region.height)));
  const insetX = Math.floor((right - left) * (region.inset ?? 0));
  const insetY = Math.floor((bottom - top) * (region.inset ?? 0));
  let black = 0;
  let total = 0;
  for (let y = top + insetY; y < bottom - insetY; y++) {
    for (let x = left + insetX; x < right - insetX; x++) {
      const i = (y * width + x) * channels;
      const r = pixels[i];
      const g = channels === 1 ? r : pixels[i + 1];
      const b = channels === 1 ? r : pixels[i + 2];
      if (r < 40 && g < 40 && b < 40) black++;
      total++;
    }
  }
  return black / Math.max(1, total);
}

export async function saveDownload(download, dir) {
  const target = path.join(dir, download.suggestedFilename());
  await download.saveAs(target);
  return target;
}

export function installPageGuards(page, markers = [uniqueMarker, fixtureFilename]) {
  const pageErrors = [];
  const networkViolations = [];
  page.on('pageerror', error => pageErrors.push(error.message || String(error)));
  page.on('request', request => {
    const url = request.url();
    const method = request.method().toUpperCase();
    const parsed = new URL(url);
    const local = ['127.0.0.1', 'localhost'].includes(parsed.hostname) || ['blob:', 'data:'].includes(parsed.protocol);
    const allowedOcrGet = method === 'GET' && parsed.protocol === 'https:' && parsed.hostname === 'tessdata.projectnaptha.com' && /^\/4\.0\.0\/eng\.traineddata(?:\.gz)?$/i.test(parsed.pathname);
    if (!local && !allowedOcrGet) {
      networkViolations.push(`external request: ${method} ${url}`);
    }
    const postData = request.postData() || '';
    for (const marker of markers) {
      if (url.includes(marker) || url.includes(encodeURIComponent(marker))) networkViolations.push(`marker in URL: ${marker}`);
      if (postData.includes(marker)) networkViolations.push(`marker in request body: ${marker}`);
    }
  });
  return { pageErrors, networkViolations };
}

export async function expectNoGuardViolations(guards) {
  if (guards.pageErrors.length) throw new Error(`Uncaught page errors:\n${guards.pageErrors.join('\n')}`);
  if (guards.networkViolations.length) throw new Error(`Network privacy violations:\n${guards.networkViolations.join('\n')}`);
}

export async function openTool(page, route, title) {
  await page.goto(route);
  await page.getByTestId('tool-title').waitFor({ state: 'visible' });
  await page.getByTestId('tool-title').evaluate((el, expected) => {
    if (el.textContent !== expected) throw new Error(`Expected ${expected}, got ${el.textContent}`);
  }, title);
}

export async function runAndSaveDownload(page, downloadDir, expectedName) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('run-tool').click()
  ]);
  if (download.suggestedFilename() !== expectedName) {
    throw new Error(`Expected download ${expectedName}, got ${download.suggestedFilename()}`);
  }
  return saveDownload(download, downloadDir);
}
