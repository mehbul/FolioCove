import { test, expect } from '@playwright/test';
import path from 'node:path';
import {
  createImageOnlyTextPdf,
  expectNoGuardViolations,
  fixtureFilename,
  installPageGuards,
  makeFixtureDir,
  openTool,
  pdfPageCount,
  pdfText,
  runAndSaveDownload,
  uniqueMarker
} from './helpers.mjs';

function normalizeOcrText(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

test.describe('network-dependent OCR validation', () => {
  test.skip(process.env.PRIVYPDF_RUN_OCR !== '1', 'OCR end-to-end is local-only because English traineddata is fetched from tessdata.projectnaptha.com. Run npm run test:e2e:ocr when deterministic model access is available.');

  test('searchable OCR creates independently extractable recognized text', async ({ page }) => {
    const dir = await makeFixtureDir();
    const expectedWords = ['LOCAL', 'SCAN', 'ALPHA'];
    const source = await createImageOnlyTextPdf(page, path.join(dir, fixtureFilename), ['LOCAL SCAN ALPHA', 'CLEAR OCR WORDS']);
    expect(normalizeOcrText(await pdfText(source))).not.toContain(expectedWords.join(' '));

    const guards = installPageGuards(page, [fixtureFilename, uniqueMarker, 'LOCAL SCAN ALPHA']);

    await openTool(page, '/ocr-pdf/', 'Searchable OCR PDF');
    await page.getByTestId('file-input').setInputFiles(source);
    const output = await runAndSaveDownload(page, dir, 'searchable-ocr.pdf');

    expect(await pdfPageCount(output)).toBe(1);
    const searchableText = normalizeOcrText(await pdfText(output));
    for (const word of expectedWords) expect(searchableText).toContain(word);
    expect(searchableText).toContain('CLEAR');
    await expectNoGuardViolations(guards);
  });
});
