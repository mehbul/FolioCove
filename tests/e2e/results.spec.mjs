import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createPdf,makeFixtureDir,runAndSaveDownload,pdfPageCount,installPageGuards,expectNoGuardViolations} from './helpers.mjs';
import {readableBytes} from '../../src/app/results.mjs';

const base=process.env.FOLIOCOVE_PAGES_TEST?'/FolioCove':'';

test('Prepared download shows actual size and can be downloaded again until selection changes',async({page})=>{
 const dir=await makeFixtureDir(),first=await createPdf(path.join(dir,'one.pdf'),['DOWNLOAD-ONE']),second=await createPdf(path.join(dir,'two.pdf'),['DOWNLOAD-TWO']);
 const guards=installPageGuards(page,['DOWNLOAD-ONE','DOWNLOAD-TWO']);
 await page.goto(base+'/merge-pdf/');await page.getByTestId('file-input').setInputFiles([first,second]);
 const output=await runAndSaveDownload(page,dir,'merged.pdf');
 const panel=page.getByRole('region',{name:'Prepared download'});
 await expect(panel).toContainText(`merged.pdf · ${readableBytes((await fs.stat(output)).size)}`);
 const pending=page.waitForEvent('download');await panel.getByRole('link',{name:'Download again'}).click();
 const repeated=await pending,repeatedPath=path.join(dir,'repeated.pdf');await repeated.saveAs(repeatedPath);
 expect(await fs.readFile(repeatedPath)).toEqual(await fs.readFile(output));
 expect(await pdfPageCount(repeatedPath)).toBe(2);
 await page.locator('#files .file').last().getByRole('button',{name:'Remove file',exact:true}).click();
 await expect(panel).toBeHidden();
 expectNoGuardViolations(guards);
});

test('Compression result compares real file sizes without promising a reduction',async({page})=>{
 const dir=await makeFixtureDir(),input=await createPdf(path.join(dir,'small.pdf'),['COMPRESSION-SAMPLE']);
 await page.goto(base+'/?tool=lossless');await page.getByTestId('file-input').setInputFiles(input);
 const output=await runAndSaveDownload(page,dir,'lossless.pdf');
 const panel=page.getByRole('region',{name:'Prepared download'}),inputSize=(await fs.stat(input)).size,outputSize=(await fs.stat(output)).size;
 await expect(panel).toContainText(`Original ${readableBytes(inputSize)} → output ${readableBytes(outputSize)}`);
 await expect(panel).toContainText(outputSize<inputSize?'smaller':outputSize>inputSize?'larger':'unchanged');
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Public help distinguishes public bug reports from private security disclosures',async({page})=>{
 test.skip(!process.env.FOLIOCOVE_PAGES_TEST,'Help page is public-only');
 await page.goto('/FolioCove/support/');
 await expect(page.getByRole('link',{name:'GitHub’s private vulnerability reporting form'})).toHaveAttribute('href','https://github.com/mehbul/FolioCove/security/advisories/new');
 await expect(page.locator('article')).toContainText('GitHub reports are public');
 await expect(page.locator('article')).toContainText('A dedicated general-support email has not yet been set up');
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
