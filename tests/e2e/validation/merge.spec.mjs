import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
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
