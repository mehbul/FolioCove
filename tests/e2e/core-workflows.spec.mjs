import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  createDocumentPhoto,
  createMalformedPdf,
  createPdf,
  expectNoGuardViolations,
  fixtureFilename,
  installPageGuards,
  makeFixtureDir,
  openTool,
  pdfMetadata,
  pdfPageCount,
  pdfText,
  runAndSaveDownload,
  uniqueMarker
} from './helpers.mjs';

test.describe('core workflow downloads', () => {
  test('merge and split produce parseable PDFs with expected page counts', async ({ page }) => {
    const dir = await makeFixtureDir();
    const first = await createPdf(path.join(dir, fixtureFilename), ['MERGE-FIRST']);
    const second = await createPdf(path.join(dir, 'second-synthetic.pdf'), ['MERGE-SECOND', 'MERGE-THIRD']);
    const guards = installPageGuards(page);

    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await page.getByTestId('file-input').setInputFiles([first, second]);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const merged = await runAndSaveDownload(page, dir, 'merged.pdf');
    await expect(page.getByTestId('status')).toContainText('Done');
    expect(await pdfPageCount(merged)).toBe(3);
    await expectNoGuardViolations(guards);

    await openTool(page, '/split-pdf/', 'Extract pages');
    await page.getByTestId('file-input').setInputFiles(merged);
    await page.getByLabel('Pages to keep').fill('2-3');
    const split = await runAndSaveDownload(page, dir, 'extracted-pages.pdf');
    expect(await pdfPageCount(split)).toBe(2);
    const text = await pdfText(split);
    expect(text).toContain('MERGE-SECOND');
    expect(text).toContain('MERGE-THIRD');
    await expectNoGuardViolations(guards);
  });

  test('visual organizer changes page order and keeps output parseable', async ({ page }) => {
    const dir = await makeFixtureDir();
    const source = await createPdf(path.join(dir, fixtureFilename), ['ORGANIZE-PAGE-ONE', 'ORGANIZE-PAGE-TWO', 'ORGANIZE-PAGE-THREE']);
    const guards = installPageGuards(page);

    await openTool(page, '/organize-pdf/', 'Visual page organizer');
    await page.getByTestId('file-input').setInputFiles(source);
    await expect(page.getByTestId('page-thumb')).toHaveCount(3);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    await page.getByRole('button', { name: 'Move page later' }).first().click();
    await expect(page.getByTestId('page-thumb')).toHaveCount(3);
    await expect(page.getByTestId('run-tool')).toBeEnabled();
    const organized = await runAndSaveDownload(page, dir, 'visually-organized.pdf');
    expect(await pdfPageCount(organized)).toBe(3);
    const text = await pdfText(organized);
    expect(text.indexOf('ORGANIZE-PAGE-TWO')).toBeLessThan(text.indexOf('ORGANIZE-PAGE-ONE'));
    await expectNoGuardViolations(guards);
  });

  test('target compression creates a parseable local PDF', async ({ page }) => {
    const dir = await makeFixtureDir();
    const source = await createPdf(path.join(dir, fixtureFilename), ['COMPRESS-PAGE-ONE', 'COMPRESS-PAGE-TWO']);
    const guards = installPageGuards(page);

    await openTool(page, '/compress-pdf/', 'Compress to target size');
    await page.getByTestId('file-input').setInputFiles(source);
    await page.getByLabel('Maximum size').selectOption('200');
    const compressed = await runAndSaveDownload(page, dir, 'target-compressed.pdf');
    expect(await pdfPageCount(compressed)).toBe(2);
    await expect(page.getByTestId('status')).toContainText('Created');
    await expectNoGuardViolations(guards);
  });

  test('camera scanner converts synthetic document photo to PDF', async ({ page }) => {
    const dir = await makeFixtureDir();
    const photo = await createDocumentPhoto(path.join(dir, 'privypdf-e2e-photo-74291.png'));
    const guards = installPageGuards(page, ['privypdf-e2e-photo-74291.png', uniqueMarker]);

    await openTool(page, '/scan-pdf/', 'Camera document scanner');
    await page.getByTestId('file-input').setInputFiles(photo);
    await page.getByLabel('Enhancement').selectOption('document');
    const scanned = await runAndSaveDownload(page, dir, 'camera-scan.pdf');
    expect(await pdfPageCount(scanned)).toBe(1);
    await expectNoGuardViolations(guards);
  });

  test('edit and typed sign add expected text to downloaded PDFs', async ({ page }) => {
    const dir = await makeFixtureDir();
    const source = await createPdf(path.join(dir, fixtureFilename), ['EDIT-SIGN-BASE', 'EDIT-SIGN-PAGE-TWO']);
    const guards = installPageGuards(page);

    await openTool(page, '/edit-pdf/', 'Edit PDF');
    await page.getByTestId('file-input').setInputFiles(source);
    await page.getByLabel('Text').fill('ADDED-E2E-TEXT');
    await page.getByLabel('Page').fill('2');
    const edited = await runAndSaveDownload(page, dir, 'edited.pdf');
    expect(await pdfText(edited)).toContain('ADDED-E2E-TEXT');

    await openTool(page, '/sign-pdf/', 'Sign PDF');
    await page.getByTestId('file-input').setInputFiles(source);
    await page.getByLabel('Signer name').fill('Ada E2E');
    const signed = await runAndSaveDownload(page, dir, 'signed.pdf');
    expect(await pdfText(signed)).toContain('Signed by Ada E2E');
    await expectNoGuardViolations(guards);
  });

  test('redaction rasterizes output so original target text is not extractable', async ({ page }) => {
    const dir = await makeFixtureDir();
    const source = await createPdf(path.join(dir, fixtureFilename), ['REDACTION-BASE'], { redactionTarget: 'SECRET-REDACT-74291' });
    const guards = installPageGuards(page, [fixtureFilename, uniqueMarker, 'SECRET-REDACT-74291']);

    await openTool(page, '/redact-pdf/', 'Secure redact');
    await page.getByTestId('file-input').setInputFiles(source);
    await page.getByLabel('Left %').fill('8');
    await page.getByLabel('Top %').fill('40');
    await page.getByLabel('Width %').fill('65');
    await page.getByLabel('Height %').fill('20');
    const redacted = await runAndSaveDownload(page, dir, 'securely-redacted.pdf');
    expect(await pdfPageCount(redacted)).toBe(1);
    expect(await pdfText(redacted)).not.toContain('SECRET-REDACT-74291');
    await expectNoGuardViolations(guards);
  });

  test('privacy inspector reports metadata and downloads sanitized copy', async ({ page }) => {
    const dir = await makeFixtureDir();
    const source = await createPdf(path.join(dir, fixtureFilename), ['PRIVACY-INSPECTOR-BASE'], { metadata: true });
    const guards = installPageGuards(page);

    await openTool(page, '/privacy-inspector/', 'Privacy Inspector');
    await page.getByTestId('file-input').setInputFiles(source);
    await expect(page.getByLabel('Download a sanitized sharing copy')).toBeChecked();
    const safe = await runAndSaveDownload(page, dir, 'safe-to-share.pdf');
    await expect(page.getByTestId('status')).toContainText('Privacy report');
    await expect(page.getByTestId('status')).toContainText('populated metadata fields');
    const metadata = await pdfMetadata(safe);
    expect(metadata.title || '').toBe('');
    expect(metadata.author || '').toBe('');
    expect(await pdfPageCount(safe)).toBe(1);
    await expectNoGuardViolations(guards);
  });
});

test.describe('unsupported and malformed inputs', () => {
  test('wrong file type shows a clear error and does not download', async ({ page }) => {
    const dir = await makeFixtureDir();
    const wrong = path.join(dir, 'not-a-pdf-74291.txt');
    await fs.writeFile(wrong, 'not a pdf');
    const guards = installPageGuards(page, ['not-a-pdf-74291.txt']);

    await openTool(page, '/merge-pdf/', 'Merge PDFs');
    await page.getByTestId('file-input').setInputFiles(wrong);
    await expect(page.getByTestId('status')).toContainText('Some files were not accepted');
    await expect(page.getByTestId('run-tool')).toBeDisabled();
    await expectNoGuardViolations(guards);
  });

  test('malformed PDF shows an error and no misleading download', async ({ page }) => {
    const dir = await makeFixtureDir();
    const malformed = await createMalformedPdf(path.join(dir, fixtureFilename));
    const guards = installPageGuards(page);

    await openTool(page, '/split-pdf/', 'Extract pages');
    await page.getByTestId('file-input').setInputFiles(malformed);
    await page.getByLabel('Pages to keep').fill('1');
    const noDownload = page.waitForEvent('download', { timeout: 1500 }).then(() => 'downloaded', () => 'none');
    await page.getByTestId('run-tool').click();
    await expect(page.getByTestId('status')).toHaveClass(/error/);
    await expect(page.getByTestId('status')).not.toBeEmpty();
    await expect(noDownload).resolves.toBe('none');
    await expectNoGuardViolations(guards);
  });
});
