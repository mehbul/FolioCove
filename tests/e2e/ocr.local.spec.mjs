import { test, expect } from '@playwright/test';
import path from 'node:path';
import {
  createPdf,
  expectNoGuardViolations,
  fixtureFilename,
  installPageGuards,
  makeFixtureDir,
  openTool,
  pdfPageCount,
  runAndSaveDownload,
  uniqueMarker
} from './helpers.mjs';

test.describe('network-dependent OCR validation', () => {
  test.skip(process.env.PRIVYPDF_RUN_OCR !== '1', 'OCR end-to-end is local-only because English traineddata is fetched from tessdata.projectnaptha.com. Run npm run test:e2e:ocr when deterministic model access is available.');

  test('searchable OCR creates a parseable PDF when English model access is available', async ({ page }) => {
    const dir = await makeFixtureDir();
    const source = await createPdf(path.join(dir, fixtureFilename), ['OCR SAMPLE ENGLISH TEXT']);
    const guards = installPageGuards(page, [fixtureFilename, uniqueMarker]);

    await openTool(page, '/ocr-pdf/', 'Searchable OCR PDF');
    await page.getByTestId('file-input').setInputFiles(source);
    const output = await runAndSaveDownload(page, dir, 'searchable-ocr.pdf');
    expect(await pdfPageCount(output)).toBe(1);
    await expectNoGuardViolations(guards);
  });
});