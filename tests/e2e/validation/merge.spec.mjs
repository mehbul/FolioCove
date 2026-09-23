import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createCanvas } from '@napi-rs/canvas';
import { PDFDict, PDFDocument, PDFName, PDFString, StandardFonts, degrees, rgb } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  createCcittScanPdf,
  createMalformedPdf,
  expectNoGuardViolations,
  installPageGuards,
  makeFixtureDir,
  openTool,
  saveDownload
} from '../helpers.mjs';

const standardFontDataUrl = 'node_modules/pdfjs-dist/standard_fonts/';
const wasmUrl = 'node_modules/pdfjs-dist/wasm/';

const fixtures = [
  {
    filename: 'pvp-m01-a.pdf',
    pages: [{ marker: 'PVP-M01-A1', width: 300, height: 500 }]
  },
  {
    filename: 'pvp-m01-b.pdf',
    pages: [
      { marker: 'PVP-M01-B1', width: 612, height: 792 },
      { marker: 'PVP-M01-B2', width: 640, height: 360 }
    ]
  }
];

const expectedPages = fixtures.flatMap(fixture => fixture.pages);
const expectedMarkers = expectedPages.map(page => page.marker);

const m02Fixtures = [
  {
    filename: 'pvp-m02-portrait.pdf',
    marker: 'PVP-M02-PORTRAIT',
    mediaBox: { x: 5, y: 10, width: 420, height: 640 },
    cropBox: { x: 17, y: 28, width: 390, height: 600 },
    rotation: 0
  },
  {
    filename: 'pvp-m02-landscape.pdf',
    marker: 'PVP-M02-LANDSCAPE',
    mediaBox: { x: 0, y: 0, width: 720, height: 420 },
    cropBox: { x: 24, y: 18, width: 672, height: 384 },
    rotation: 90
  },
  {
    filename: 'pvp-m02-square.pdf',
    marker: 'PVP-M02-SQUARE',
    mediaBox: { x: 8, y: 12, width: 510, height: 510 },
    cropBox: { x: 26, y: 30, width: 474, height: 474 },
    rotation: 270
  }
];

const m02Markers = m02Fixtures.map(fixture => fixture.marker);

const m03ScanFilename = 'pvp-m03-ccitt-scan.pdf';
const m03TextFilename = 'pvp-m03-selectable-text.pdf';
const m03TextMarker = 'PVP-M03-SELECTABLE-TEXT';
const m03ScanDarkPixelBand = { minimum: 0.29, maximum: 0.31 };

const m05UnicodeFilename = 'pvp-m05-unicode.pdf';
const m05UnicodeSha256 = 'a79dbd29551f2d138c6b3a49df77997d66cb120652931f9729801ab3759e00f5';
const m05AsciiFilename = 'pvp-m05-ascii.pdf';
const m05AsciiMarker = 'PVP-M05-ASCII';
const m05UnicodeText = 'Ω λ Ж Д';
const m05GlyphBox = { x: 48, y: 224, width: 350, height: 82 };

const m06BulkFilename = 'pvp-m06-50-pages.pdf';
const m06TailFilename = 'pvp-m06-tail.pdf';
const m06BulkMarkers = Array.from({ length: 50 }, (_, index) =>
  `PVP-M06-P${String(index + 1).padStart(3, '0')}`
);
const m06TailMarker = 'PVP-M06-TAIL';
const m06ExpectedMarkers = [...m06BulkMarkers, m06TailMarker];

const m07FirstFilename = 'pvp-m07-first.pdf';
const m07BlankFilename = 'pvp-m07-blank.pdf';
const m07LastFilename = 'pvp-m07-last.pdf';
const m07FirstMarker = 'PVP-M07-FIRST';
const m07LastMarker = 'PVP-M07-LAST';

const m08FirstFilename = 'pvp-m08-first.pdf';
const m08SecondFilename = 'pvp-m08-second.pdf';
const m08FirstMarker = 'PVP-M08-FIRST';
const m08SecondMarker = 'PVP-M08-SECOND';

const m09ValidFilename = 'pvp-m09-valid.pdf';
const m09TruncatedFilename = 'pvp-m09-truncated.pdf';
const m09ReplacementFilename = 'pvp-m09-replacement.pdf';
const m09ValidMarker = 'PVP-M09-VALID';
const m09ReplacementMarker = 'PVP-M09-REPLACEMENT';

const m04FormFilename = 'pvp-m04-filled-form.pdf';
const m04LinkFilename = 'pvp-m04-link.pdf';
const m04Value = 'PVP-M04-FILLED-VALUE';
const m04LinkMarker = 'PVP-M04-LINK-REGION';
const m04LinkUrl = 'https://example.invalid/pvp-m04-link';
const m04FieldBox = { x: 54, y: 330, width: 300, height: 54 };
const m04LinkBox = { x: 54, y: 184, width: 300, height: 54 };

async function createMarkerPdf(filePath, pages) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.HelveticaBold);

  for (const pageSpec of pages) {
    const page = document.addPage([pageSpec.width, pageSpec.height]);
    page.drawText(pageSpec.marker, {
      x: 36,
      y: pageSpec.height - 72,
      size: 18,
      font,
      color: rgb(0.05, 0.08, 0.12)
    });
  }

  await fs.writeFile(filePath, await document.save());
  return filePath;
}

async function inspectMergedPdf(filePath) {
  const bytes = await fs.readFile(filePath);
  const pdfLibDocument = await PDFDocument.load(bytes);
  const pdfLibSizes = pdfLibDocument.getPages().map(page => page.getSize());
  const task = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    standardFontDataUrl,
    wasmUrl
  });
  const pdfJsDocument = await task.promise;

  try {
    const textByPage = [];
    const pdfJsSizes = [];
    for (let pageNumber = 1; pageNumber <= pdfJsDocument.numPages; pageNumber += 1) {
      const page = await pdfJsDocument.getPage(pageNumber);
      const text = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      textByPage.push(text.items.map(item => item.str).join(' '));
      pdfJsSizes.push({ width: viewport.width, height: viewport.height });
    }

    return {
      byteLength: bytes.length,
      pdfLibPageCount: pdfLibDocument.getPageCount(),
      pdfJsPageCount: pdfJsDocument.numPages,
      pdfLibSizes,
      pdfJsSizes,
      textByPage
    };
  } finally {
    await task.destroy();
  }
}

async function createGeometryPdf(filePath, fixture) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  const page = document.addPage([fixture.mediaBox.width, fixture.mediaBox.height]);
  page.setMediaBox(
    fixture.mediaBox.x,
    fixture.mediaBox.y,
    fixture.mediaBox.width,
    fixture.mediaBox.height
  );
  page.setCropBox(
    fixture.cropBox.x,
    fixture.cropBox.y,
    fixture.cropBox.width,
    fixture.cropBox.height
  );
  page.setRotation(degrees(fixture.rotation));
  page.drawText(fixture.marker, {
    x: fixture.cropBox.x + 36,
    y: fixture.cropBox.y + fixture.cropBox.height - 72,
    size: 18,
    font,
    color: rgb(0.05, 0.08, 0.12)
  });

  await fs.writeFile(filePath, await document.save());
  return filePath;
}

async function inspectGeometryPdf(filePath) {
  const bytes = await fs.readFile(filePath);
  const pdfLibDocument = await PDFDocument.load(bytes);
  const pdfLibPages = pdfLibDocument.getPages().map(page => ({
    mediaBox: page.getMediaBox(),
    cropBox: page.getCropBox(),
    rotation: page.getRotation().angle
  }));
  const task = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    standardFontDataUrl,
    wasmUrl
  });
  const pdfJsDocument = await task.promise;

  try {
    const pdfJsPages = [];
    for (let pageNumber = 1; pageNumber <= pdfJsDocument.numPages; pageNumber += 1) {
      const page = await pdfJsDocument.getPage(pageNumber);
      const text = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      pdfJsPages.push({
        text: text.items.map(item => item.str).join(' '),
        view: [...page.view],
        rotation: page.rotate,
        viewport: { width: viewport.width, height: viewport.height }
      });
    }

    return {
      byteLength: bytes.length,
      pdfLibPageCount: pdfLibDocument.getPageCount(),
      pdfJsPageCount: pdfJsDocument.numPages,
      pdfLibPages,
      pdfJsPages
    };
  } finally {
    await task.destroy();
  }
}

async function inspectRenderedPdf(filePath) {
  const bytes = await fs.readFile(filePath);
  const pdfLibDocument = await PDFDocument.load(bytes);
  const task = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    standardFontDataUrl,
    wasmUrl
  });
  const pdfJsDocument = await task.promise;

  try {
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdfJsDocument.numPages; pageNumber += 1) {
      const page = await pdfJsDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const canvasContext = canvas.getContext('2d');
      await page.render({ canvas, canvasContext, viewport }).promise;

      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height).data;
      let darkPixels = 0;
      let opaquePixels = 0;
      for (let offset = 0; offset < imageData.length; offset += 4) {
        if (
          imageData[offset] < 220 ||
          imageData[offset + 1] < 220 ||
          imageData[offset + 2] < 220
        ) {
          darkPixels += 1;
        }
        if (imageData[offset + 3] === 255) opaquePixels += 1;
      }

      const pixelCount = canvas.width * canvas.height;
      pages.push({
        text: textContent.items.map(item => item.str).join(' '),
        width: canvas.width,
        height: canvas.height,
        darkPixelRatio: darkPixels / pixelCount,
        opaquePixelRatio: opaquePixels / pixelCount,
        nonWhitePixelRatio: (() => {
          let nonWhite = 0;
          for (let offset = 0; offset < imageData.length; offset += 4) {
            if (imageData[offset] !== 255 || imageData[offset + 1] !== 255 || imageData[offset + 2] !== 255 || imageData[offset + 3] !== 255) nonWhite += 1;
          }
          return nonWhite / pixelCount;
        })(),
        png: canvas.toBuffer('image/png')
      });
      page.cleanup();
    }

    return {
      byteLength: bytes.length,
      pdfLibPageCount: pdfLibDocument.getPageCount(),
      pdfJsPageCount: pdfJsDocument.numPages,
      pages
    };
  } finally {
    await task.destroy();
  }
}

function expectRatioInBand(actual, band) {
  expect(actual).toBeGreaterThanOrEqual(band.minimum);
  expect(actual).toBeLessThanOrEqual(band.maximum);
}

function expectBoxWithinTolerance(actual, expected, tolerance = 1) {
  for (const coordinate of ['x', 'y', 'width', 'height']) {
    expect(Math.abs(actual[coordinate] - expected[coordinate])).toBeLessThanOrEqual(tolerance);
  }
}

function expectCoordinatesWithinTolerance(actual, expected, tolerance = 1) {
  expect(actual).toHaveLength(expected.length);
  for (const [index, coordinate] of actual.entries()) {
    expect(Math.abs(coordinate - expected[index])).toBeLessThanOrEqual(tolerance);
  }
}

function cropBoxAsView(cropBox) {
  return [
    cropBox.x,
    cropBox.y,
    cropBox.x + cropBox.width,
    cropBox.y + cropBox.height
  ];
}

async function createFilledFormPdf(filePath) {
  const document = await PDFDocument.create();
  const page = document.addPage([420, 540]);
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  page.drawText('M04 synthetic form', { x: 54, y: 450, size: 15, font });
  page.drawText('Filled value:', { x: 54, y: 400, size: 11, font });
  const field = document.getForm().createTextField('m04.synthetic.value');
  field.addToPage(page, {
    ...m04FieldBox,
    font,
    fontSize: 16,
    borderWidth: 1,
    borderColor: rgb(0.1, 0.2, 0.3),
    backgroundColor: rgb(1, 1, 1)
  });
  field.setText(m04Value);
  document.getForm().updateFieldAppearances(font);
  await fs.writeFile(filePath, await document.save());
  return filePath;
}

async function createLinkedPagePdf(filePath) {
  const document = await PDFDocument.create();
  const page = document.addPage([420, 540]);
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  page.drawText('M04 synthetic link', { x: 54, y: 450, size: 15, font });
  page.drawRectangle({
    ...m04LinkBox,
    color: rgb(0.86, 0.94, 1),
    borderColor: rgb(0.08, 0.31, 0.72),
    borderWidth: 2
  });
  page.drawText(m04LinkMarker, {
    x: m04LinkBox.x + 16,
    y: m04LinkBox.y + 19,
    size: 14,
    font,
    color: rgb(0.05, 0.2, 0.56)
  });
  const action = document.context.obj({
    S: PDFName.of('URI'),
    URI: PDFString.of(m04LinkUrl)
  });
  const link = document.context.obj({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of('Link'),
    Rect: [m04LinkBox.x, m04LinkBox.y, m04LinkBox.x + m04LinkBox.width, m04LinkBox.y + m04LinkBox.height],
    Border: [0, 0, 0],
    A: action
  });
  page.node.addAnnot(document.context.register(link));
  await fs.writeFile(filePath, await document.save());
  return filePath;
}

function regionPixels(imageData, canvasWidth, canvasHeight, box, inset = 0) {
  const left = Math.max(0, Math.floor(box.x + inset));
  const right = Math.min(canvasWidth, Math.ceil(box.x + box.width - inset));
  const top = Math.max(0, Math.floor(canvasHeight - box.y - box.height + inset));
  const bottom = Math.min(canvasHeight, Math.ceil(canvasHeight - box.y - inset));
  const pixels = [];
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const offset = (y * canvasWidth + x) * 4;
      pixels.push(imageData[offset], imageData[offset + 1], imageData[offset + 2]);
    }
  }
  return pixels;
}

function darkPixelRatio(pixels) {
  let dark = 0;
  for (let offset = 0; offset < pixels.length; offset += 3) {
    if (pixels[offset] < 150 && pixels[offset + 1] < 150 && pixels[offset + 2] < 150) dark += 1;
  }
  return dark / (pixels.length / 3);
}

function changedPixelRatio(source, output) {
  expect(output).toHaveLength(source.length);
  let changed = 0;
  for (let offset = 0; offset < source.length; offset += 3) {
    if (Math.max(
      Math.abs(source[offset] - output[offset]),
      Math.abs(source[offset + 1] - output[offset + 1]),
      Math.abs(source[offset + 2] - output[offset + 2])
    ) > 20) changed += 1;
  }
  return changed / (source.length / 3);
}

async function inspectFormAnnotationPdf(filePath) {
  const bytes = await fs.readFile(filePath);
  const pdfLibDocument = await PDFDocument.load(bytes);
  const structure = {
    catalogHasAcroForm: pdfLibDocument.catalog.has(PDFName.of('AcroForm')),
    fieldCount: pdfLibDocument.getForm().getFields().length,
    pages: []
  };
  for (const page of pdfLibDocument.getPages()) {
    const annotations = [];
    const annots = page.node.Annots();
    for (let index = 0; index < (annots?.size() ?? 0); index += 1) {
      const annotation = pdfLibDocument.context.lookup(annots.get(index), PDFDict);
      const subtype = annotation.get(PDFName.of('Subtype'))?.toString() ?? null;
      const action = pdfLibDocument.context.lookup(annotation.get(PDFName.of('A')));
      const uri = action instanceof PDFDict
        ? pdfLibDocument.context.lookup(action.get(PDFName.of('URI')))?.decodeText?.() ?? null
        : null;
      annotations.push({
        subtype,
        hasAppearance: annotation.has(PDFName.of('AP')),
        uri
      });
    }
    structure.pages.push(annotations);
  }
  structure.widgetCount = structure.pages.flat().filter(annotation => annotation.subtype === '/Widget').length;
  structure.linkCount = structure.pages.flat().filter(annotation => annotation.subtype === '/Link').length;
  structure.widgetsRemainInteractive = structure.catalogHasAcroForm && structure.fieldCount > 0 && structure.widgetCount > 0;
  structure.orphanWidgetCount = structure.widgetsRemainInteractive ? 0 : structure.widgetCount;

  const task = pdfjs.getDocument({ data: new Uint8Array(bytes), standardFontDataUrl, wasmUrl });
  const pdfJsDocument = await task.promise;
  try {
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdfJsDocument.numPages; pageNumber += 1) {
      const page = await pdfJsDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const canvasContext = canvas.getContext('2d');
      await page.render({ canvas, canvasContext, viewport }).promise;
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height).data;
      const text = await page.getTextContent();
      const annotations = await page.getAnnotations({ intent: 'display' });
      pages.push({
        width: canvas.width,
        height: canvas.height,
        text: text.items.map(item => item.str).join(' '),
        annotations: annotations.map(annotation => ({
          subtype: annotation.subtype,
          fieldValue: annotation.fieldValue ?? null,
          url: annotation.unsafeUrl ?? annotation.url ?? null
        })),
        fieldInterior: regionPixels(imageData, canvas.width, canvas.height, m04FieldBox, 8),
        linkInterior: regionPixels(imageData, canvas.width, canvas.height, m04LinkBox, 8),
        png: canvas.toBuffer('image/png')
      });
      page.cleanup();
    }
    return {
      byteLength: bytes.length,
      pdfLibPageCount: pdfLibDocument.getPageCount(),
      pdfJsPageCount: pdfJsDocument.numPages,
      structure,
      pages
    };
  } finally {
    await task.destroy();
  }
}

test('M01 merges one-page and two-page PDFs in exact order with page sizes preserved', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();
  const fixturePaths = [];

  try {
    for (const fixture of fixtures) {
      fixturePaths.push(await createMarkerPdf(path.join(fixtureDir, fixture.filename), fixture.pages));
    }

    const guards = installPageGuards(page, [
      ...expectedMarkers,
      ...fixtures.map(fixture => fixture.filename)
    ]);
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));

    const startedAt = performance.now();
    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');

    await page.getByTestId('file-input').setInputFiles(fixturePaths);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('run-tool').click()
    ]);
    expect(download.suggestedFilename()).toBe('merged.pdf');
    const mergedPath = await saveDownload(download, fixtureDir);
    await expect(page.getByTestId('status')).toHaveClass(/ok/);
    await expect(page.getByTestId('status')).toContainText('Done');
    expect(downloadEvents).toEqual(['merged.pdf']);

    const oracle = await inspectMergedPdf(mergedPath);
    expect(oracle.pdfLibPageCount).toBe(3);
    expect(oracle.pdfJsPageCount).toBe(3);
    expect(oracle.textByPage).toHaveLength(3);

    for (const [index, marker] of expectedMarkers.entries()) {
      expect(oracle.textByPage[index]).toContain(marker);
      for (const otherMarker of expectedMarkers.filter(candidate => candidate !== marker)) {
        expect(oracle.textByPage[index]).not.toContain(otherMarker);
      }
    }

    const extractedText = oracle.textByPage.join('\n');
    const markerOffsets = expectedMarkers.map(marker => extractedText.indexOf(marker));
    expect(markerOffsets.every(offset => offset >= 0)).toBe(true);
    expect(markerOffsets).toEqual([...markerOffsets].sort((left, right) => left - right));

    for (const [index, expectedPage] of expectedPages.entries()) {
      expect(oracle.pdfLibSizes[index].width).toBeCloseTo(expectedPage.width, 4);
      expect(oracle.pdfLibSizes[index].height).toBeCloseTo(expectedPage.height, 4);
      expect(oracle.pdfJsSizes[index].width).toBeCloseTo(expectedPage.width, 4);
      expect(oracle.pdfJsSizes[index].height).toBeCloseTo(expectedPage.height, 4);
    }

    await expectNoGuardViolations(guards);
    await testInfo.attach('M01-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'M01',
        browserProject: testInfo.project.name,
        durationMs: Math.round(performance.now() - startedAt),
        statusText: await page.getByTestId('status').textContent(),
        outputBytes: oracle.byteLength,
        downloadEvents,
        markersByPage: oracle.textByPage,
        pdfLibSizes: oracle.pdfLibSizes,
        pdfJsSizes: oracle.pdfJsSizes
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('M02 preserves boxes and effective rotations for portrait, landscape and square pages', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();
  const fixturePaths = [];

  try {
    for (const fixture of m02Fixtures) {
      fixturePaths.push(await createGeometryPdf(path.join(fixtureDir, fixture.filename), fixture));
    }

    const sourceOracles = [];
    for (const fixturePath of fixturePaths) {
      sourceOracles.push(await inspectGeometryPdf(fixturePath));
    }

    for (const [index, fixture] of m02Fixtures.entries()) {
      const source = sourceOracles[index];
      expect(source.pdfLibPageCount).toBe(1);
      expect(source.pdfJsPageCount).toBe(1);
      expect(source.pdfJsPages[0].text).toContain(fixture.marker);
      expectBoxWithinTolerance(source.pdfLibPages[0].mediaBox, fixture.mediaBox);
      expectBoxWithinTolerance(source.pdfLibPages[0].cropBox, fixture.cropBox);
      expect(source.pdfLibPages[0].rotation).toBe(fixture.rotation);
      expectCoordinatesWithinTolerance(source.pdfJsPages[0].view, cropBoxAsView(fixture.cropBox));
      expect(source.pdfJsPages[0].rotation).toBe(fixture.rotation);
    }

    const guards = installPageGuards(page, [
      ...m02Markers,
      ...m02Fixtures.map(fixture => fixture.filename)
    ]);
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));

    const startedAt = performance.now();
    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');

    await page.getByTestId('file-input').setInputFiles(fixturePaths);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('run-tool').click()
    ]);
    expect(download.suggestedFilename()).toBe('merged.pdf');
    const mergedPath = await saveDownload(download, fixtureDir);
    await expect(page.getByTestId('status')).toHaveClass(/ok/);
    await expect(page.getByTestId('status')).toContainText('Done');
    expect(downloadEvents).toEqual(['merged.pdf']);

    const output = await inspectGeometryPdf(mergedPath);
    expect(output.pdfLibPageCount).toBe(3);
    expect(output.pdfJsPageCount).toBe(3);
    expect(output.pdfLibPages).toHaveLength(3);
    expect(output.pdfJsPages).toHaveLength(3);

    for (const [index, fixture] of m02Fixtures.entries()) {
      const source = sourceOracles[index];
      const outputLibPage = output.pdfLibPages[index];
      const outputJsPage = output.pdfJsPages[index];

      expect(outputJsPage.text).toContain(fixture.marker);
      for (const otherMarker of m02Markers.filter(marker => marker !== fixture.marker)) {
        expect(outputJsPage.text).not.toContain(otherMarker);
      }

      expectBoxWithinTolerance(outputLibPage.mediaBox, source.pdfLibPages[0].mediaBox);
      expectBoxWithinTolerance(outputLibPage.cropBox, source.pdfLibPages[0].cropBox);
      expect(outputLibPage.rotation).toBe(source.pdfLibPages[0].rotation);
      expectCoordinatesWithinTolerance(outputJsPage.view, source.pdfJsPages[0].view);
      expect(outputJsPage.rotation).toBe(source.pdfJsPages[0].rotation);
      expect(outputJsPage.viewport.width).toBeCloseTo(source.pdfJsPages[0].viewport.width, 4);
      expect(outputJsPage.viewport.height).toBeCloseTo(source.pdfJsPages[0].viewport.height, 4);
    }

    await expectNoGuardViolations(guards);
    await testInfo.attach('M02-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'M02',
        browserProject: testInfo.project.name,
        durationMs: Math.round(performance.now() - startedAt),
        statusText: await page.getByTestId('status').textContent(),
        outputBytes: output.byteLength,
        downloadEvents,
        sourcePages: sourceOracles.map(source => ({
          pdfLib: source.pdfLibPages[0],
          pdfJs: source.pdfJsPages[0]
        })),
        outputPages: output.pdfLibPages.map((pdfLibPage, index) => ({
          pdfLib: pdfLibPage,
          pdfJs: output.pdfJsPages[index]
        }))
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('M03 preserves a CCITT image-only scan beside a selectable-text PDF', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();

  try {
    const scanPath = await createCcittScanPdf(path.join(fixtureDir, m03ScanFilename));
    const textPath = await createMarkerPdf(path.join(fixtureDir, m03TextFilename), [
      { marker: m03TextMarker, width: 460, height: 560 }
    ]);
    const sourceScan = await inspectRenderedPdf(scanPath);
    const sourceText = await inspectRenderedPdf(textPath);

    expect(sourceScan.pdfLibPageCount).toBe(1);
    expect(sourceScan.pdfJsPageCount).toBe(1);
    expect(sourceScan.pages).toHaveLength(1);
    expect(sourceScan.pages[0].text.trim()).toBe('');
    expectRatioInBand(sourceScan.pages[0].darkPixelRatio, m03ScanDarkPixelBand);
    expect(sourceScan.pages[0].opaquePixelRatio).toBe(1);

    expect(sourceText.pdfLibPageCount).toBe(1);
    expect(sourceText.pdfJsPageCount).toBe(1);
    expect(sourceText.pages).toHaveLength(1);
    expect(sourceText.pages[0].text).toContain(m03TextMarker);
    expect(sourceText.pages[0].darkPixelRatio).toBeGreaterThan(0.001);
    expect(sourceText.pages[0].opaquePixelRatio).toBe(1);

    const guards = installPageGuards(page, [
      m03TextMarker,
      m03ScanFilename,
      m03TextFilename
    ]);
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));

    const startedAt = performance.now();
    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');

    await page.getByTestId('file-input').setInputFiles([scanPath, textPath]);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const processingStartedAt = performance.now();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('run-tool').click()
    ]);
    const processingDurationMs = performance.now() - processingStartedAt;
    expect(processingDurationMs).toBeLessThanOrEqual(20_000);
    expect(download.suggestedFilename()).toBe('merged.pdf');
    const mergedPath = await saveDownload(download, fixtureDir);
    await expect(page.getByTestId('status')).toHaveClass(/ok/);
    await expect(page.getByTestId('status')).toContainText('Done');
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    expect(downloadEvents).toEqual(['merged.pdf']);

    const output = await inspectRenderedPdf(mergedPath);
    expect(output.pdfLibPageCount).toBe(2);
    expect(output.pdfJsPageCount).toBe(2);
    expect(output.pages).toHaveLength(2);

    const [outputScan, outputText] = output.pages;
    expect(outputScan.text.trim()).toBe('');
    expect(outputScan.text).not.toContain(m03TextMarker);
    expectRatioInBand(outputScan.darkPixelRatio, m03ScanDarkPixelBand);
    expect(outputScan.darkPixelRatio).toBeCloseTo(sourceScan.pages[0].darkPixelRatio, 6);
    expect(outputScan.opaquePixelRatio).toBe(1);

    expect(outputText.text).toContain(m03TextMarker);
    expect(outputText.darkPixelRatio).toBeGreaterThan(0.001);
    expect(outputText.opaquePixelRatio).toBe(1);

    await expectNoGuardViolations(guards);
    for (const [name, body] of [
      ['M03-source-scan-render', sourceScan.pages[0].png],
      ['M03-output-scan-render', outputScan.png],
      ['M03-source-text-render', sourceText.pages[0].png],
      ['M03-output-text-render', outputText.png]
    ]) {
      await testInfo.attach(name, { body, contentType: 'image/png' });
    }
    await testInfo.attach('M03-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'M03',
        browserProject: testInfo.project.name,
        durationMs: Math.round(performance.now() - startedAt),
        processingDurationMs: Math.round(processingDurationMs),
        statusText: await page.getByTestId('status').textContent(),
        outputBytes: output.byteLength,
        downloadEvents,
        scanDarkPixelBand: m03ScanDarkPixelBand,
        sourcePages: [sourceScan.pages[0], sourceText.pages[0]].map(({ png, ...pageResult }) => pageResult),
        outputPages: output.pages.map(({ png, ...pageResult }) => pageResult)
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('M04 preserves a filled form appearance and a linked region', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();

  try {
    const formPath = await createFilledFormPdf(path.join(fixtureDir, m04FormFilename));
    const linkPath = await createLinkedPagePdf(path.join(fixtureDir, m04LinkFilename));
    const sourceForm = await inspectFormAnnotationPdf(formPath);
    const sourceLink = await inspectFormAnnotationPdf(linkPath);

    expect(sourceForm.pdfLibPageCount).toBe(1);
    expect(sourceForm.pdfJsPageCount).toBe(1);
    expect(sourceForm.structure.fieldCount).toBe(1);
    expect(sourceForm.structure.widgetCount).toBe(1);
    expect(sourceForm.structure.widgetsRemainInteractive).toBe(true);
    expect(sourceForm.pages[0].annotations.some(annotation => annotation.fieldValue === m04Value)).toBe(true);
    expect(darkPixelRatio(sourceForm.pages[0].fieldInterior)).toBeGreaterThan(0.01);
    expect(sourceLink.pdfLibPageCount).toBe(1);
    expect(sourceLink.pdfJsPageCount).toBe(1);
    expect(sourceLink.structure.linkCount).toBe(1);
    expect(sourceLink.structure.pages[0][0].uri).toBe(m04LinkUrl);
    expect(sourceLink.pages[0].text).toContain(m04LinkMarker);
    expect(darkPixelRatio(sourceLink.pages[0].linkInterior)).toBeGreaterThan(0.01);

    const guards = installPageGuards(page, [
      m04FormFilename, m04LinkFilename, m04Value, m04LinkMarker, m04LinkUrl
    ]);
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));
    const startedAt = performance.now();
    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');

    await page.getByTestId('file-input').setInputFiles([formPath, linkPath]);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const processingStartedAt = performance.now();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('run-tool').click()
    ]);
    const processingDurationMs = performance.now() - processingStartedAt;
    expect(processingDurationMs).toBeLessThanOrEqual(20_000);
    expect(download.suggestedFilename()).toBe('merged.pdf');
    const mergedPath = await saveDownload(download, fixtureDir);
    await expect(page.getByTestId('status')).toHaveClass(/ok/);
    await expect(page.getByTestId('status')).toContainText('Done');
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    expect(downloadEvents).toEqual(['merged.pdf']);

    const output = await inspectFormAnnotationPdf(mergedPath);
    expect(output.pdfLibPageCount).toBe(2);
    expect(output.pdfJsPageCount).toBe(2);
    expect(output.pages).toHaveLength(2);
    expect(output.pages[0].width).toBe(sourceForm.pages[0].width);
    expect(output.pages[0].height).toBe(sourceForm.pages[0].height);
    expect(output.pages[1].width).toBe(sourceLink.pages[0].width);
    expect(output.pages[1].height).toBe(sourceLink.pages[0].height);

    const sourceFieldDarkRatio = darkPixelRatio(sourceForm.pages[0].fieldInterior);
    const outputFieldDarkRatio = darkPixelRatio(output.pages[0].fieldInterior);
    const fieldChangedRatio = changedPixelRatio(sourceForm.pages[0].fieldInterior, output.pages[0].fieldInterior);
    expect(outputFieldDarkRatio).toBeGreaterThan(0.01);
    expect(fieldChangedRatio).toBeLessThan(0.01);
    expect(output.structure.catalogHasAcroForm).toBe(false);
    expect(output.structure.fieldCount).toBe(0);
    expect(output.structure.widgetCount).toBe(1);
    expect(output.structure.widgetsRemainInteractive).toBe(false);
    expect(output.structure.orphanWidgetCount).toBe(1);
    expect(output.pages[0].annotations.some(annotation => annotation.fieldValue === m04Value)).toBe(true);
    expect(output.structure.pages[0].filter(annotation => annotation.subtype === '/Link')).toHaveLength(0);
    expect(output.structure.pages[0].some(annotation => annotation.subtype === '/Widget' && annotation.hasAppearance)).toBe(true);

    const sourceLinkDarkRatio = darkPixelRatio(sourceLink.pages[0].linkInterior);
    const outputLinkDarkRatio = darkPixelRatio(output.pages[1].linkInterior);
    const linkChangedRatio = changedPixelRatio(sourceLink.pages[0].linkInterior, output.pages[1].linkInterior);
    expect(outputLinkDarkRatio).toBeGreaterThan(0.01);
    expect(linkChangedRatio).toBeLessThan(0.01);
    expect(output.pages[1].text).toContain(m04LinkMarker);
    expect(output.structure.pages[1].filter(annotation => annotation.subtype === '/Widget')).toHaveLength(0);
    expect(output.structure.linkCount).toBe(1);
    expect(output.structure.pages[1][0].uri).toBe(m04LinkUrl);
    expect(output.pages[0].annotations.some(annotation => annotation.subtype === 'Link')).toBe(false);
    expect(output.pages[1].annotations.some(annotation => annotation.subtype === 'Link' && annotation.url === m04LinkUrl)).toBe(true);

    await expectNoGuardViolations(guards);
    for (const [name, body] of [
      ['M04-source-form-render', sourceForm.pages[0].png],
      ['M04-output-form-render', output.pages[0].png],
      ['M04-source-link-render', sourceLink.pages[0].png],
      ['M04-output-link-render', output.pages[1].png]
    ]) {
      await testInfo.attach(name, { body, contentType: 'image/png' });
    }
    await testInfo.attach('M04-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'M04',
        browserProject: testInfo.project.name,
        durationMs: Math.round(performance.now() - startedAt),
        processingDurationMs: Math.round(processingDurationMs),
        statusText: await page.getByTestId('status').textContent(),
        outputBytes: output.byteLength,
        downloadEvents,
        fieldVisual: { sourceDarkRatio: sourceFieldDarkRatio, outputDarkRatio: outputFieldDarkRatio, changedPixelRatio: fieldChangedRatio },
        linkVisual: { sourceDarkRatio: sourceLinkDarkRatio, outputDarkRatio: outputLinkDarkRatio, changedPixelRatio: linkChangedRatio },
        sourceStructure: { form: sourceForm.structure, link: sourceLink.structure },
        outputStructure: output.structure,
        outputPdfJsAnnotations: output.pages.map(({ annotations }) => annotations)
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

async function inspectM05Pdf(filePath, glyphBox) {
  const bytes = await fs.readFile(filePath);
  const pdfLibDocument = await PDFDocument.load(bytes);
  const embeddedFontCount = pdfLibDocument.context.enumerateIndirectObjects().filter(([, object]) =>
    object instanceof PDFDict &&
    object.get(PDFName.of('Type'))?.toString() === '/FontDescriptor' &&
    object.has(PDFName.of('FontFile2'))
  ).length;

  // PDF.js reports decoder/font substitution problems through Node console warnings.
  const pdfJsDiagnostics = [];
  const originalWarn = console.warn;
  const originalError = console.error;
  console.warn = (...args) => {
    pdfJsDiagnostics.push({ level: 'warn', message: args.map(String).join(' ') });
    originalWarn(...args);
  };
  console.error = (...args) => {
    pdfJsDiagnostics.push({ level: 'error', message: args.map(String).join(' ') });
    originalError(...args);
  };

  try {
    const task = pdfjs.getDocument({
      data: new Uint8Array(bytes),
      standardFontDataUrl,
      wasmUrl,
      useSystemFonts: false,
      verbosity: pdfjs.VerbosityLevel.WARNINGS
    });
    try {
      const pdfJsDocument = await task.promise;
      const pages = [];
      for (let pageNumber = 1; pageNumber <= pdfJsDocument.numPages; pageNumber += 1) {
        const page = await pdfJsDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
        const context = canvas.getContext('2d');
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const text = await page.getTextContent();
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        pages.push({
          width: canvas.width,
          height: canvas.height,
          text: text.items.map(item => item.str).join(' '),
          glyphPixels: glyphBox ? regionPixels(imageData, canvas.width, canvas.height, glyphBox) : null,
          png: canvas.toBuffer('image/png')
        });
        page.cleanup();
      }
      return {
        byteLength: bytes.length,
        pdfLibPageCount: pdfLibDocument.getPageCount(),
        pdfJsPageCount: pdfJsDocument.numPages,
        embeddedFontCount,
        pdfJsDiagnostics,
        pages
      };
    } finally {
      await task.destroy();
    }
  } finally {
    console.warn = originalWarn;
    console.error = originalError;
  }
}

test('M05 preserves an embedded Unicode-font glyph region beside an ASCII page', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();
  const unicodePath = path.resolve('tests/fixtures', m05UnicodeFilename);
  const asciiPath = path.join(fixtureDir, m05AsciiFilename);

  try {
    const fixtureHash = createHash('sha256').update(await fs.readFile(unicodePath)).digest('hex');
    expect(fixtureHash).toBe(m05UnicodeSha256);
    await createMarkerPdf(asciiPath, [{ marker: m05AsciiMarker, width: 540, height: 400 }]);

    const sourceUnicode = await inspectM05Pdf(unicodePath, m05GlyphBox);
    const sourceAscii = await inspectM05Pdf(asciiPath);
    expect(sourceUnicode.pdfLibPageCount).toBe(1);
    expect(sourceUnicode.pdfJsPageCount).toBe(1);
    expect(sourceUnicode.embeddedFontCount).toBeGreaterThan(0);
    expect(sourceUnicode.pdfJsDiagnostics).toEqual([]);
    expect(sourceUnicode.pages[0].text).toContain(m05UnicodeText);
    const sourceDarkRatio = darkPixelRatio(sourceUnicode.pages[0].glyphPixels);
    expect(sourceDarkRatio).toBeGreaterThan(0.01);
    expect(sourceAscii.pdfJsDiagnostics).toEqual([]);
    expect(sourceAscii.pages[0].text).toContain(m05AsciiMarker);

    const guards = installPageGuards(page, [
      m05UnicodeFilename, m05AsciiFilename, m05UnicodeText, m05AsciiMarker
    ]);
    const fontErrors = [];
    page.on('console', message => {
      if (message.type() === 'error' && /font/i.test(message.text())) fontErrors.push(message.text());
    });
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));
    const startedAt = performance.now();
    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');

    await page.getByTestId('file-input').setInputFiles([unicodePath, asciiPath]);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const processingStartedAt = performance.now();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('run-tool').click()
    ]);
    const processingDurationMs = performance.now() - processingStartedAt;
    expect(processingDurationMs).toBeLessThanOrEqual(20_000);
    expect(download.suggestedFilename()).toBe('merged.pdf');
    const mergedPath = await saveDownload(download, fixtureDir);
    await expect(page.getByTestId('status')).toHaveClass(/ok/);
    await expect(page.getByTestId('status')).toContainText('Done');
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    expect(downloadEvents).toEqual(['merged.pdf']);
    expect(fontErrors).toEqual([]);

    const output = await inspectM05Pdf(mergedPath, m05GlyphBox);
    expect(output.pdfLibPageCount).toBe(2);
    expect(output.pdfJsPageCount).toBe(2);
    expect(output.pages).toHaveLength(2);
    expect(output.embeddedFontCount).toBeGreaterThan(0);
    expect(output.pdfJsDiagnostics).toEqual([]);
    expect(output.pages[0].width).toBe(sourceUnicode.pages[0].width);
    expect(output.pages[0].height).toBe(sourceUnicode.pages[0].height);
    expect(output.pages[1].width).toBe(sourceAscii.pages[0].width);
    expect(output.pages[1].height).toBe(sourceAscii.pages[0].height);

    const outputDarkRatio = darkPixelRatio(output.pages[0].glyphPixels);
    const sourceGlyphBytes = Buffer.from(sourceUnicode.pages[0].glyphPixels);
    const outputGlyphBytes = Buffer.from(output.pages[0].glyphPixels);
    const sourceGlyphSha256 = createHash('sha256').update(sourceGlyphBytes).digest('hex');
    const outputGlyphSha256 = createHash('sha256').update(outputGlyphBytes).digest('hex');
    expect(outputDarkRatio).toBeGreaterThan(0.01);
    expect(outputGlyphBytes.equals(sourceGlyphBytes)).toBe(true);
    expect(output.pages[0].text).toContain(m05UnicodeText);
    expect(output.pages[0].text).not.toContain(m05AsciiMarker);
    expect(output.pages[1].text).toContain(m05AsciiMarker);
    expect(output.pages[1].text).not.toContain(m05UnicodeText);
    expect(fontErrors).toEqual([]);
    await expectNoGuardViolations(guards);

    for (const [name, body] of [
      ['M05-source-unicode-render', sourceUnicode.pages[0].png],
      ['M05-output-unicode-render', output.pages[0].png],
      ['M05-source-ascii-render', sourceAscii.pages[0].png],
      ['M05-output-ascii-render', output.pages[1].png]
    ]) {
      await testInfo.attach(name, { body, contentType: 'image/png' });
    }
    await testInfo.attach('M05-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'M05',
        browserProject: testInfo.project.name,
        durationMs: Math.round(performance.now() - startedAt),
        processingDurationMs: Math.round(processingDurationMs),
        fixtureSha256: fixtureHash,
        statusText: await page.getByTestId('status').textContent(),
        outputBytes: output.byteLength,
        downloadEvents,
        fontErrors,
        sourcePdfJsDiagnostics: sourceUnicode.pdfJsDiagnostics,
        asciiPdfJsDiagnostics: sourceAscii.pdfJsDiagnostics,
        outputPdfJsDiagnostics: output.pdfJsDiagnostics,
        sourceEmbeddedFonts: sourceUnicode.embeddedFontCount,
        outputEmbeddedFonts: output.embeddedFontCount,
        unicodeText: output.pages[0].text,
        asciiText: output.pages[1].text,
        sourceDarkRatio,
        outputDarkRatio,
        sourceGlyphSha256,
        outputGlyphSha256,
        glyphPixelsIdentical: outputGlyphBytes.equals(sourceGlyphBytes)
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('M06 merges 50 marker pages and a final page within 75 seconds, then returns idle', async ({ page }, testInfo) => {
  test.setTimeout(100_000);
  const fixtureDir = await makeFixtureDir();

  try {
    const bulkPath = await createMarkerPdf(
      path.join(fixtureDir, m06BulkFilename),
      m06BulkMarkers.map(marker => ({ marker, width: 300, height: 500 }))
    );
    const tailPath = await createMarkerPdf(
      path.join(fixtureDir, m06TailFilename),
      [{ marker: m06TailMarker, width: 300, height: 500 }]
    );
    const bulkSource = await PDFDocument.load(await fs.readFile(bulkPath));
    const tailSource = await PDFDocument.load(await fs.readFile(tailPath));
    expect(bulkSource.getPageCount()).toBe(50);
    expect(tailSource.getPageCount()).toBe(1);

    const guards = installPageGuards(page, [
      m06BulkFilename, m06TailFilename, ...m06ExpectedMarkers
    ]);
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));
    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');

    await page.getByTestId('file-input').setInputFiles([bulkPath, tailPath]);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const processingStartedAt = performance.now();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 75_000 }),
      page.getByTestId('run-tool').click()
    ]);
    expect(download.suggestedFilename()).toBe('merged.pdf');
    const mergedPath = await saveDownload(download, fixtureDir);
    await expect(page.getByTestId('status')).toHaveClass(/ok/);
    await expect(page.getByTestId('status')).toContainText('Done');
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    await expect(page.locator('#job-controls')).toBeHidden();
    for (const selector of ['.sidebar', '#options', '#files']) {
      await expect(page.locator(selector)).toHaveJSProperty('inert', false);
    }
    const processingDurationMs = performance.now() - processingStartedAt;
    expect(processingDurationMs).toBeLessThan(75_000);
    expect(downloadEvents).toEqual(['merged.pdf']);

    const output = await inspectMergedPdf(mergedPath);
    expect(output.pdfLibPageCount).toBe(51);
    expect(output.pdfJsPageCount).toBe(51);
    expect(output.textByPage.map(text => text.trim())).toEqual(m06ExpectedMarkers);
    await expectNoGuardViolations(guards);

    await testInfo.attach('M06-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'M06',
        browserProject: testInfo.project.name,
        processingDurationMs: Math.round(processingDurationMs),
        statusText: await page.getByTestId('status').textContent(),
        runButtonEnabled: await page.getByTestId('run-tool').isEnabled(),
        jobControlsHidden: await page.locator('#job-controls').isHidden(),
        interactiveRegionsIdle: Object.fromEntries(await Promise.all(
          ['.sidebar', '#options', '#files'].map(async selector => [
            selector, !(await page.locator(selector).evaluate(element => element.inert))
          ])
        )),
        outputBytes: output.byteLength,
        pdfLibPageCount: output.pdfLibPageCount,
        pdfJsPageCount: output.pdfJsPageCount,
        downloadEvents,
        extractedMarkers: output.textByPage.map(text => text.trim()),
        firstMarker: output.textByPage[0].trim(),
        middleMarker: output.textByPage[25].trim(),
        lastMarker: output.textByPage[50].trim()
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('M07 preserves a blank middle page between marked pages', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();

  try {
    const firstPath = await createMarkerPdf(
      path.join(fixtureDir, m07FirstFilename),
      [{ marker: m07FirstMarker, width: 300, height: 500 }]
    );
    const blankDocument = await PDFDocument.create();
    blankDocument.addPage([300, 500]);
    const blankPath = path.join(fixtureDir, m07BlankFilename);
    await fs.writeFile(blankPath, await blankDocument.save());
    const lastPath = await createMarkerPdf(
      path.join(fixtureDir, m07LastFilename),
      [{ marker: m07LastMarker, width: 300, height: 500 }]
    );

    const guards = installPageGuards(page, [
      m07FirstFilename, m07BlankFilename, m07LastFilename, m07FirstMarker, m07LastMarker
    ]);
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));
    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    await page.getByTestId('file-input').setInputFiles([firstPath, blankPath, lastPath]);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('run-tool').click()
    ]);
    expect(download.suggestedFilename()).toBe('merged.pdf');
    const mergedPath = await saveDownload(download, fixtureDir);
    await expect(page.getByTestId('status')).toHaveClass(/ok/);
    await expect(page.getByTestId('status')).toContainText('Done');
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    await expect(page.locator('#job-controls')).toBeHidden();
    for (const selector of ['.sidebar', '#options', '#files']) {
      await expect(page.locator(selector)).toHaveJSProperty('inert', false);
    }

    const output = await inspectRenderedPdf(mergedPath);
    expect(output.pdfLibPageCount).toBe(3);
    expect(output.pdfJsPageCount).toBe(3);
    expect(output.pages.map(result => result.text.trim())).toEqual([
      m07FirstMarker, '', m07LastMarker
    ]);
    expect(output.pages[1].darkPixelRatio).toBe(0);
    expect(output.pages[1].opaquePixelRatio).toBe(1);
    expect(output.pages[1].nonWhitePixelRatio).toBe(0);
    expect(output.pages[0].darkPixelRatio).toBeGreaterThan(0.001);
    expect(output.pages[2].darkPixelRatio).toBeGreaterThan(0.001);
    expect(downloadEvents).toEqual(['merged.pdf']);
    await expectNoGuardViolations(guards);

    await testInfo.attach('M07-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'M07',
        browserProject: testInfo.project.name,
        pdfLibPageCount: output.pdfLibPageCount,
        pdfJsPageCount: output.pdfJsPageCount,
        extractedTextByPage: output.pages.map(result => result.text.trim()),
        darkPixelRatioByPage: output.pages.map(result => result.darkPixelRatio),
        opaquePixelRatioByPage: output.pages.map(result => result.opaquePixelRatio),
        nonWhitePixelRatioByPage: output.pages.map(result => result.nonWhitePixelRatio),
        outputBytes: output.byteLength,
        downloadEvents,
        statusText: await page.getByTestId('status').textContent(),
        runButtonEnabled: await page.getByTestId('run-tool').isEnabled(),
        jobControlsHidden: await page.locator('#job-controls').isHidden(),
        interactiveRegionsIdle: Object.fromEntries(await Promise.all(
          ['.sidebar', '#options', '#files'].map(async selector => [
            selector, !(await page.locator(selector).evaluate(element => element.inert))
          ])
        ))
      }, null, 2)),
      contentType: 'application/json'
    });
    for (const [index, result] of output.pages.entries()) {
      await testInfo.attach(`M07-page-${index + 1}`, {
        body: result.png,
        contentType: 'image/png'
      });
    }
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('M08 requires two selected PDFs before merge can run', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();

  try {
    const firstPath = await createMarkerPdf(
      path.join(fixtureDir, m08FirstFilename),
      [{ marker: m08FirstMarker, width: 300, height: 500 }]
    );
    const secondPath = await createMarkerPdf(
      path.join(fixtureDir, m08SecondFilename),
      [{ marker: m08SecondMarker, width: 300, height: 500 }]
    );
    const guards = installPageGuards(page, [
      m08FirstFilename, m08SecondFilename, m08FirstMarker, m08SecondMarker
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('privypdf-metrics-optin', JSON.stringify(true));
      localStorage.setItem('privypdf-beta-metrics', JSON.stringify([]));
    });
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));
    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');
    await expect(page.locator('#metrics-optin')).toBeChecked();
    await expect(page.locator('#metrics-summary')).toContainText('0 starts · 0 completed · 0 failed');

    await page.getByTestId('file-input').setInputFiles(firstPath);
    await expect(page.locator('#files .file-name')).toHaveText([m08FirstFilename]);
    await expect(page.getByTestId('run-tool')).toBeDisabled();
    const runButtonBox = await page.getByTestId('run-tool').boundingBox();
    expect(runButtonBox).not.toBeNull();
    const noDownloadObservationStartedAt = performance.now();
    await page.mouse.click(runButtonBox.x + runButtonBox.width / 2, runButtonBox.y + runButtonBox.height / 2);
    await page.waitForTimeout(1500);
    const noDownloadObservationDurationMs = performance.now() - noDownloadObservationStartedAt;
    await expect(page.getByTestId('status')).toBeEmpty();
    await expect(page.locator('#metrics-summary')).toContainText('0 starts · 0 completed · 0 failed');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('privypdf-beta-metrics') ?? '[]'))).toEqual([]);
    expect(downloadEvents).toEqual([]);
    await expect(page.locator('#job-controls')).toBeHidden();
    for (const selector of ['.sidebar', '#options', '#files']) {
      await expect(page.locator(selector)).toHaveJSProperty('inert', false);
    }

    await page.getByTestId('file-input').setInputFiles(secondPath);
    await expect(page.locator('#files .file-name')).toHaveText([m08FirstFilename, m08SecondFilename]);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    await expect(page.getByTestId('status')).toBeEmpty();
    expect(downloadEvents).toEqual([]);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('privypdf-beta-metrics') ?? '[]'))).toEqual([]);
    await expectNoGuardViolations(guards);

    await testInfo.attach('M08-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'M08',
        browserProject: testInfo.project.name,
        noDownloadObservationDurationMs: Math.round(noDownloadObservationDurationMs),
        outputByteCount: 0,
        filesAfterSecondSelection: await page.locator('#files .file-name').allTextContents(),
        runButtonEnabledAfterSecondSelection: await page.getByTestId('run-tool').isEnabled(),
        statusText: await page.getByTestId('status').textContent(),
        metricsSummary: await page.locator('#metrics-summary').textContent(),
        metrics: await page.evaluate(() => JSON.parse(localStorage.getItem('privypdf-beta-metrics') ?? '[]')),
        downloadEvents,
        jobControlsHidden: await page.locator('#job-controls').isHidden()
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('M09 rejects a truncated PDF without downloading a partial merge', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();

  try {
    const validPath = await createMarkerPdf(
      path.join(fixtureDir, m09ValidFilename),
      [{ marker: m09ValidMarker, width: 300, height: 500 }]
    );
    const truncatedPath = await createMalformedPdf(path.join(fixtureDir, m09TruncatedFilename));
    const replacementPath = await createMarkerPdf(
      path.join(fixtureDir, m09ReplacementFilename),
      [{ marker: m09ReplacementMarker, width: 300, height: 500 }]
    );
    const truncatedBytes = await fs.readFile(truncatedPath);
    expect(truncatedBytes.subarray(0, 4).toString()).toBe('%PDF');
    expect(truncatedBytes.length).toBeLessThan(100);
    const truncatedDocument = await PDFDocument.load(truncatedBytes);
    expect(() => truncatedDocument.getPageIndices()).toThrow();
    expect((await PDFDocument.load(await fs.readFile(validPath))).getPageCount()).toBe(1);

    const guards = installPageGuards(page, [
      m09ValidFilename, m09TruncatedFilename, m09ReplacementFilename,
      m09ValidMarker, m09ReplacementMarker
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('privypdf-metrics-optin', JSON.stringify(true));
      localStorage.setItem('privypdf-beta-metrics', JSON.stringify([]));
    });
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));
    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');

    await page.getByTestId('file-input').setInputFiles([validPath, truncatedPath]);
    await expect(page.locator('#files .file-name')).toHaveText([m09ValidFilename, m09TruncatedFilename]);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    await page.getByTestId('run-tool').click();
    await expect(page.getByTestId('status')).toHaveClass(/error/);
    await expect(page.getByTestId('status')).not.toBeEmpty();
    await expect(page.getByTestId('status')).not.toContainText('Done');
    await expect(page.getByTestId('status')).toContainText('Keep the original.');
    await expect(page.locator('#metrics-summary')).toContainText('1 starts · 0 completed · 1 failed');
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    await expect(page.locator('#job-controls')).toBeHidden();
    for (const selector of ['.sidebar', '#options', '#files']) {
      await expect(page.locator(selector)).toHaveJSProperty('inert', false);
    }
    const noDownloadObservationStartedAt = performance.now();
    await page.waitForTimeout(1500);
    const noDownloadObservationDurationMs = performance.now() - noDownloadObservationStartedAt;
    expect(downloadEvents).toEqual([]);
    await expect(page.locator('#files .file-name')).toHaveText([m09ValidFilename, m09TruncatedFilename]);

    await page.locator('#files .file').nth(1).getByRole('button', { name: 'Remove file' }).click();
    await expect(page.locator('#files .file-name')).toHaveText([m09ValidFilename]);
    await expect(page.getByTestId('run-tool')).toBeDisabled();
    await page.getByTestId('file-input').setInputFiles(replacementPath);
    await expect(page.locator('#files .file-name')).toHaveText([m09ValidFilename, m09ReplacementFilename]);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    expect(downloadEvents).toEqual([]);
    await expectNoGuardViolations(guards);

    await testInfo.attach('M09-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'M09',
        browserProject: testInfo.project.name,
        truncatedInputBytes: truncatedBytes.length,
        noDownloadObservationDurationMs: Math.round(noDownloadObservationDurationMs),
        statusClass: await page.getByTestId('status').getAttribute('class'),
        statusText: await page.getByTestId('status').textContent(),
        filesAfterRemovingTruncatedInput: [m09ValidFilename],
        filesAfterReplacement: await page.locator('#files .file-name').allTextContents(),
        runButtonEnabledAfterReplacement: await page.getByTestId('run-tool').isEnabled(),
        metrics: await page.evaluate(() => JSON.parse(localStorage.getItem('privypdf-beta-metrics') ?? '[]')),
        downloadEvents
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});
