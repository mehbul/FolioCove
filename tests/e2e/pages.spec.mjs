import {test,expect} from '@playwright/test';
import path from 'node:path';
import {makeFixtureDir,createPdf,runAndSaveDownload,pdfPageCount} from './helpers.mjs';
test.skip(!process.env.FOLIOCOVE_PAGES_TEST,'Only run against the Pages subpath server');
test('Pages subpath loads tools, navigation, PDF renderer and local worker downloads',async({page})=>{
 const failures=[];page.on('pageerror',e=>failures.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url())});
 await page.goto('/FolioCove/');await expect(page.locator('#core-tools a')).toHaveCount(35);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://mehbul.github.io/FolioCove/');
 await page.goto('/FolioCove/tools/');await expect(page.locator('.directory-list details')).toHaveCount(88);
 await page.goto('/FolioCove/merge-pdf/');await expect(page.locator('#tool-title')).toHaveText('Merge PDFs');
 const dir=await makeFixtureDir(),a=await createPdf(path.join(dir,'a.pdf'),['FIRST']),b=await createPdf(path.join(dir,'b.pdf'),['SECOND']);
 await page.getByTestId('file-input').setInputFiles([a,b]);expect(await pdfPageCount(await runAndSaveDownload(page,dir,'merged.pdf'))).toBe(2);
 await page.goto('/FolioCove/?tool=lossless');
 await page.getByTestId('file-input').setInputFiles(a);expect(await pdfPageCount(await runAndSaveDownload(page,dir,'lossless.pdf'))).toBe(1);
 await page.goto('/FolioCove/organize-pdf/');await page.getByTestId('file-input').setInputFiles(a);
 await expect(page.getByTestId('page-thumb').locator('canvas').first()).toBeVisible();
 expect(failures).toEqual([]);
});
