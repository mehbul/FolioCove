import { performance } from 'node:perf_hooks';
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
const s01Filename = 'pvp-s01-five-pages.pdf';
const s01Markers = Array.from({ length: 5 }, (_, index) =>
  `PVP-S01-P${String(index + 1).padStart(2, '0')}`
);
const s02Filename = 'pvp-s02-six-pages.pdf';
const s02Markers = Array.from({ length: 6 }, (_, index) =>
  `PVP-S02-P${String(index + 1).padStart(2, '0')}`
);
const s02Sizes = Array.from({ length: 6 }, (_, index) => ({
  width: 420 + index * 10,
  height: 540 + index * 10
}));
const s02SelectedIndices = [0, 2, 4, 5];

async function createS01Pdf(filePath) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  for (const marker of s01Markers) {
    const page = document.addPage([420, 540]);
    page.drawText(marker, {
      x: 40,
      y: 460,
      size: 20,
      font,
      color: rgb(0.05, 0.08, 0.12)
    });
  }
  await fs.writeFile(filePath, await document.save());
  return filePath;
}

async function createS02Pdf(filePath) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  for (const [index, marker] of s02Markers.entries()) {
    const { width, height } = s02Sizes[index];
    const page = document.addPage([width, height]);
    page.drawText(marker, {
      x: 40,
      y: height - 80,
      size: 20,
      font,
      color: rgb(0.05, 0.08, 0.12)
    });
  }
  await fs.writeFile(filePath, await document.save());
  return filePath;
}

async function inspectPdf(filePath) {
  const bytes = await fs.readFile(filePath);
  const pdfLibDocument = await PDFDocument.load(bytes);
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
      const content = await page.getTextContent();
      textByPage.push(content.items.map(item => item.str).join(' ').trim());
      const viewport = page.getViewport({ scale: 1 });
      pdfJsSizes.push({ width: viewport.width, height: viewport.height });
    }
    return {
      outputBytes: bytes.length,
      pdfLibPageCount: pdfLibDocument.getPageCount(),
      pdfJsPageCount: pdfJsDocument.numPages,
      textByPage,
      pdfLibSizes: pdfLibDocument.getPages().map(page => page.getSize()),
      pdfJsSizes
    };
  } finally {
    await task.destroy();
  }
}

test('S01 extracts pages 2-3 from a five-page PDF in exact order', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();
  try {
    const sourcePath = await createS01Pdf(path.join(fixtureDir, s01Filename));
    const source = await inspectPdf(sourcePath);
    expect(source.pdfLibPageCount).toBe(5);
    expect(source.pdfJsPageCount).toBe(5);
    expect(source.textByPage).toEqual(s01Markers);
    expect(source.pdfLibSizes).toEqual(Array.from({ length: 5 }, () => ({ width: 420, height: 540 })));
    expect(source.pdfJsSizes).toEqual(source.pdfLibSizes);

    const guards = installPageGuards(page, [s01Filename, ...s01Markers]);
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));
    await openTool(page, '/split-pdf/', 'Extract pages');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');

    await page.getByTestId('file-input').setInputFiles(sourcePath);
    await expect(page.locator('#files .file-name')).toHaveText([s01Filename]);
    await page.locator('#pages').fill('2-3');
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const startedAt = performance.now();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('run-tool').click()
    ]);
    expect(download.suggestedFilename()).toBe('extracted-pages.pdf');
    const outputPath = await saveDownload(download, fixtureDir);
    await expect(page.getByTestId('status')).toHaveClass(/ok/);
    await expect(page.getByTestId('status')).toContainText('Done');
    const durationMs = Math.round(performance.now() - startedAt);
    expect(durationMs).toBeLessThan(20_000);
    expect(downloadEvents).toEqual(['extracted-pages.pdf']);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    await expect(page.locator('#job-controls')).toBeHidden();
    for (const selector of ['.sidebar', '#options', '#files']) {
      await expect(page.locator(selector)).toHaveJSProperty('inert', false);
    }

    const output = await inspectPdf(outputPath);
    expect(output.pdfLibPageCount).toBe(2);
    expect(output.pdfJsPageCount).toBe(2);
    expect(output.textByPage).toEqual(s01Markers.slice(1, 3));
    expect(output.pdfLibSizes).toEqual(source.pdfLibSizes.slice(1, 3));
    expect(output.pdfJsSizes).toEqual(source.pdfJsSizes.slice(1, 3));
    await expectNoGuardViolations(guards);

    await testInfo.attach('S01-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'S01',
        browserProject: testInfo.project.name,
        durationMs,
        statusText: await page.getByTestId('status').textContent(),
        outputBytes: output.outputBytes,
        downloadEvents,
        sourceMarkersByPage: source.textByPage,
        outputMarkersByPage: output.textByPage,
        pdfLibPageCount: output.pdfLibPageCount,
        pdfJsPageCount: output.pdfJsPageCount,
        pdfLibSizes: output.pdfLibSizes,
        pdfJsSizes: output.pdfJsSizes
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('S02 extracts pages 1, 3, 5-6 from a six-page PDF in exact order and size', async ({ page }, testInfo) => {
  const fixtureDir = await makeFixtureDir();
  try {
    const sourcePath = await createS02Pdf(path.join(fixtureDir, s02Filename));
    const source = await inspectPdf(sourcePath);
    expect(source.pdfLibPageCount).toBe(6);
    expect(source.pdfJsPageCount).toBe(6);
    expect(source.textByPage).toEqual(s02Markers);
    expect(source.pdfLibSizes).toEqual(s02Sizes);
    expect(source.pdfJsSizes).toEqual(s02Sizes);

    const guards = installPageGuards(page, [s02Filename, ...s02Markers]);
    const downloadEvents = [];
    page.on('download', download => downloadEvents.push(download.suggestedFilename()));
    await openTool(page, '/split-pdf/', 'Extract pages');
    await expect(page.getByTestId('tool-limit')).toHaveText(
      'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.'
    );
    await expect(page.getByTestId('file-input')).toHaveAttribute('accept', 'application/pdf');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');

    await page.getByTestId('file-input').setInputFiles(sourcePath);
    await expect(page.locator('#files .file-name')).toHaveText([s02Filename]);
    await page.locator('#pages').fill('1, 3, 5-6');
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const startedAt = performance.now();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('run-tool').click()
    ]);
    expect(download.suggestedFilename()).toBe('extracted-pages.pdf');
    const outputPath = await saveDownload(download, fixtureDir);
    await expect(page.getByTestId('status')).toHaveClass(/ok/);
    await expect(page.getByTestId('status')).toContainText('Done');
    const durationMs = Math.round(performance.now() - startedAt);
    expect(durationMs).toBeLessThan(20_000);
    expect(downloadEvents).toEqual(['extracted-pages.pdf']);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    await expect(page.locator('#job-controls')).toBeHidden();
    for (const selector of ['.sidebar', '#options', '#files']) {
      await expect(page.locator(selector)).toHaveJSProperty('inert', false);
    }

    const output = await inspectPdf(outputPath);
    const selectedMarkers = s02SelectedIndices.map(index => source.textByPage[index]);
    const selectedPdfLibSizes = s02SelectedIndices.map(index => source.pdfLibSizes[index]);
    const selectedPdfJsSizes = s02SelectedIndices.map(index => source.pdfJsSizes[index]);
    expect(output.pdfLibPageCount).toBe(4);
    expect(output.pdfJsPageCount).toBe(4);
    expect(output.textByPage).toEqual(selectedMarkers);
    expect(output.pdfLibSizes).toEqual(selectedPdfLibSizes);
    expect(output.pdfJsSizes).toEqual(selectedPdfJsSizes);
    await expectNoGuardViolations(guards);

    await testInfo.attach('S02-oracle-results', {
      body: Buffer.from(JSON.stringify({
        caseId: 'S02',
        browserProject: testInfo.project.name,
        selection: '1, 3, 5-6',
        durationMs,
        statusText: await page.getByTestId('status').textContent(),
        outputBytes: output.outputBytes,
        downloadEvents,
        sourceMarkersByPage: source.textByPage,
        outputMarkersByPage: output.textByPage,
        pdfLibPageCount: output.pdfLibPageCount,
        pdfJsPageCount: output.pdfJsPageCount,
        sourcePdfLibSizes: source.pdfLibSizes,
        outputPdfLibSizes: output.pdfLibSizes,
        sourcePdfJsSizes: source.pdfJsSizes,
        outputPdfJsSizes: output.pdfJsSizes
      }, null, 2)),
      contentType: 'application/json'
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});
