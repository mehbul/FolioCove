import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  createPdf,
  expectNoGuardViolations,
  installPageGuards,
  makeFixtureDir,
  openTool,
  pdfText,
  runAndSaveDownload
} from './helpers.mjs';

const mergeRoute = `${process.env.FOLIOCOVE_PAGES_TEST ? '/FolioCove' : ''}/merge-pdf/`;
const markers = ['ORDER-A', 'ORDER-B1', 'ORDER-B2', 'ORDER-C'];

test('slow startup keeps file selection unavailable until all workspace modules are ready', async ({ page }) => {
  let release, requested;
  const held = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { requested = resolve; });
  await page.route('**/assets/extended.js', async route => { requested(); await held; await route.continue(); });
  await page.goto(mergeRoute, {waitUntil:'domcontentloaded'});
  await started;
  try {
    await expect(page.getByTestId('file-input')).toBeDisabled();
    await expect(page.locator('#workspace')).toHaveAttribute('inert', '');
    await expect(page.locator('#workspace')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('#boot-state')).toBeVisible();
  } finally { release(); }
  await expect(page.getByTestId('file-input')).toBeEnabled();
  await expect(page.locator('#workspace')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#boot-state')).toBeHidden();
  const dir=await makeFixtureDir();
  const first=await createPdf(path.join(dir,'ready-one.pdf'),['ORDER-A']);
  const second=await createPdf(path.join(dir,'ready-two.pdf'),['ORDER-C']);
  await page.getByTestId('file-input').setInputFiles([first,second]);
  expect(pageMarkers(await pdfText(await runAndSaveDownload(page,dir,'merged.pdf')))).toEqual(['ORDER-A','ORDER-C']);
});

function pageMarkers(text) {
  return text.split('\n').map(page => markers.find(marker => page.includes(marker)));
}

test('merge follows the selected order, keeps keyboard focus and clears stale completion', async ({ page }) => {
  const dir = await makeFixtureDir();
  const first = await createPdf(path.join(dir, 'first.pdf'), ['ORDER-A']);
  const second = await createPdf(path.join(dir, 'second.pdf'), ['ORDER-B1', 'ORDER-B2']);
  const third = await createPdf(path.join(dir, 'third.pdf'), ['ORDER-C']);
  const guards = installPageGuards(page, markers);
  await openTool(page, mergeRoute, 'Merge PDFs');
  await page.getByTestId('file-input').setInputFiles([first, second, third]);
  await expect(page.locator('.file-selection-summary')).toHaveText(/^3 files · .+ total$/);
  await expect(page.getByRole('button', { name: 'Move up: first.pdf', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Move down: third.pdf', exact: true })).toBeDisabled();

  const moveThird = page.getByRole('button', { name: 'Move up: third.pdf', exact: true });
  await moveThird.focus();
  await moveThird.press('Enter');
  await expect(moveThird).toBeFocused();
  await moveThird.press('Enter');
  await expect(page.locator('#files .file-name')).toHaveText(['third.pdf', 'first.pdf', 'second.pdf']);
  await page.getByRole('button', { name: 'Move down: first.pdf', exact: true }).click();
  await expect(page.locator('#files .file-name')).toHaveText(['third.pdf', 'second.pdf', 'first.pdf']);
  await expect(page.locator('.file-order-announcement')).toHaveText('first.pdf moved to position 3 of 3.');

  const merged = await runAndSaveDownload(page, dir, 'merged.pdf');
  expect(pageMarkers(await pdfText(merged))).toEqual(['ORDER-C', 'ORDER-B1', 'ORDER-B2', 'ORDER-A']);
  await expect(page.getByTestId('status')).toContainText('Done');
  await page.getByRole('button', { name: 'Move up: second.pdf', exact: true }).click();
  await expect(page.getByTestId('status')).toBeEmpty();
  await runAndSaveDownload(page, dir, 'merged.pdf');
  await expect(page.getByTestId('status')).toContainText('Done');
  await page.locator('#files .file').last().getByRole('button', { name: 'Remove file', exact: true }).click();
  await expect(page.getByTestId('status')).toBeEmpty();
  await expect(page.locator('.file-selection-summary')).toHaveText(/^2 files · .+ total$/);
  await expectNoGuardViolations(guards);
});

test('selection handles literal filenames and remains usable on a narrow screen', async ({ page }) => {
  const dir = await makeFixtureDir();
  const first = await createPdf(path.join(dir, 'literal.pdf'), ['ORDER-A']);
  const second = await createPdf(path.join(dir, 'second.pdf'), ['ORDER-C']);
  const literalName = '<img src=x onerror=alert(1)>-a-long-synthetic-filename.pdf';
  const guards = installPageGuards(page, [literalName, ...markers]);
  await page.setViewportSize({ width: 390, height: 844 });
  await openTool(page, mergeRoute, 'Merge PDFs');
  await page.getByTestId('file-input').setInputFiles({ name: literalName, mimeType: 'application/pdf', buffer: await fs.readFile(first) });
  await expect(page.locator('#files .file-name')).toHaveText([literalName]);
  await expect(page.locator('.file-selection-summary')).toHaveText(/^1 file · .+ total$/);
  await expect(page.locator('.file-selection-hint')).toHaveText('Add another PDF to merge.');
  await expect(page.getByTestId('run-tool')).toBeDisabled();
  await page.getByTestId('file-input').setInputFiles(second);
  await expect(page.locator('#files .file-name')).toHaveText([literalName, 'second.pdf']);
  await expect(page.locator('#files img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Move up: second.pdf', exact: true }).click();
  await expect(page.locator('#files .file-name')).toHaveText(['second.pdf', literalName]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const moveBounds = await page.getByRole('button', { name: 'Move down: second.pdf', exact: true }).boundingBox();
  expect(moveBounds.height).toBeGreaterThanOrEqual(44);
  const merged = await runAndSaveDownload(page, dir, 'merged.pdf');
  expect(pageMarkers(await pdfText(merged))).toEqual(['ORDER-C', 'ORDER-A']);
  await page.locator('#files .file').last().getByRole('button', { name: 'Remove file', exact: true }).click();
  await expect(page.getByTestId('run-tool')).toBeDisabled();
  await page.locator('#files .file').getByRole('button', { name: 'Remove file', exact: true }).click();
  await expect(page.getByTestId('file-input')).toBeFocused();
  await expect(page.locator('.file-selection-summary')).toBeHidden();
  await expectNoGuardViolations(guards);
});

test('running merge rejects reordering and removal until the download completes', async ({ page }) => {
  const dir = await makeFixtureDir();
  const first = await createPdf(path.join(dir, 'first.pdf'), ['ORDER-A']);
  const second = await createPdf(path.join(dir, 'second.pdf'), ['ORDER-C']);
  const guards = installPageGuards(page, markers);
  await page.addInitScript(() => {
    const original = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (window.__holdMergeRead) await new Promise(resolve => { window.__releaseMergeRead = resolve; });
      return original.call(this);
    };
  });
  await openTool(page, mergeRoute, 'Merge PDFs');
  await page.getByTestId('file-input').setInputFiles([first, second]);
  await page.evaluate(() => { window.__holdMergeRead = true; });
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('run-tool').click();
  await expect(page.locator('#files')).toHaveJSProperty('inert', true);
  const move = page.locator('#files .file').nth(1).locator('[data-act="up"]');
  await move.evaluate(button => button.onclick());
  await page.locator('#files .remove').first().evaluate(button => button.onclick());
  await expect(page.locator('#files .file-name')).toHaveText(['first.pdf', 'second.pdf']);
  await page.evaluate(() => { window.__holdMergeRead = false; window.__releaseMergeRead(); });
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('merged.pdf');
  const merged = path.join(dir, download.suggestedFilename());
  await download.saveAs(merged);
  expect(pageMarkers(await pdfText(merged))).toEqual(['ORDER-A', 'ORDER-C']);
  await expect(page.locator('#files')).toHaveJSProperty('inert', false);
  await move.click();
  await expect(page.locator('#files .file-name')).toHaveText(['second.pdf', 'first.pdf']);
  await expectNoGuardViolations(guards);
});
