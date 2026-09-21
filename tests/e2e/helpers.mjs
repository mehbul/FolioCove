import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const standardFontDataUrl = 'node_modules/pdfjs-dist/standard_fonts/';

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
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes), standardFontDataUrl });
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
    const allowedOcrGet = method === 'GET' && parsed.hostname === 'tessdata.projectnaptha.com';
    if (!local && !allowedOcrGet && ['POST', 'PUT', 'PATCH'].includes(method)) {
      networkViolations.push(`${method} ${url}`);
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