import {test,expect} from '@playwright/test';
import path from 'node:path';
import {createPdf,makeFixtureDir,pdfPageCount,pdfText,runAndSaveDownload,installPageGuards,expectNoGuardViolations} from './helpers.mjs';

const base=process.env.FOLIOCOVE_PAGES_TEST?'/FolioCove':'';

test('A new visitor can merge bundled synthetic PDFs from the homepage',async({page})=>{
 const guards=installPageGuards(page,['FC-MERGE-A-1','FC-MERGE-B-1','FC-MERGE-B-2']);
 const dir=await makeFixtureDir();
 await page.goto(base+'/');
 const trial=page.getByRole('button',{name:'Try sample PDFs',exact:true});
 await expect(trial).toBeVisible();
 await expect(page.locator('#sample-trial')).toContainText('Synthetic samples');
 await trial.click();
 await expect(page.locator('#files .file-name')).toHaveText(['merge-first.pdf','merge-second.pdf']);
 await expect(trial).toBeHidden();
 const output=await runAndSaveDownload(page,dir,'merged.pdf');
 expect(await pdfPageCount(output)).toBe(3);
 expect((await pdfText(output)).match(/FC-MERGE-[AB]-[12]/g)).toEqual(['FC-MERGE-A-1','FC-MERGE-B-1','FC-MERGE-B-2']);
 await expect(page.getByRole('region',{name:'Prepared download'})).toBeVisible();
 await page.locator('#files .file').last().getByRole('button',{name:'Remove file',exact:true}).click();
 await page.locator('#files .file').last().getByRole('button',{name:'Remove file',exact:true}).click();
 await expect(page.getByRole('region',{name:'Prepared download'})).toBeHidden();
 await expect(trial).toBeVisible();
 await trial.click();
 await expect(page.locator('#files .file')).toHaveCount(2);
 await expectNoGuardViolations(guards);
});

test('A visitor can extract pages 2–4 using the bundled sample on a direct mobile route',async({page})=>{
 const guards=installPageGuards(page,['FC-EXTRACT-2','FC-EXTRACT-3','FC-EXTRACT-4']);
 const dir=await makeFixtureDir();
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/split-pdf/');
 await page.getByRole('button',{name:'Try sample PDF',exact:true}).click();
 await expect(page.locator('#files .file-name')).toHaveText(['extract-six-pages.pdf']);
 await expect(page.getByLabel('Pages to keep')).toHaveValue('2-4');
 const output=await runAndSaveDownload(page,dir,'extracted-pages.pdf');
 expect(await pdfPageCount(output)).toBe(3);
 expect((await pdfText(output)).match(/FC-EXTRACT-[1-6]/g)).toEqual(['FC-EXTRACT-2','FC-EXTRACT-3','FC-EXTRACT-4']);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expectNoGuardViolations(guards);
});

test('Sample trial is hidden when a visitor selects their own PDF or another tool',async({page})=>{
 const dir=await makeFixtureDir(),input=await createPdf(path.join(dir,'my-local.pdf'),['LOCAL-TRIAL-PRESERVED']);
 await page.goto(base+'/merge-pdf/');
 await expect(page.getByRole('button',{name:'Try sample PDFs',exact:true})).toBeVisible();
 await page.getByTestId('file-input').setInputFiles(input);
 await expect(page.locator('#sample-trial')).toBeHidden();
 await expect(page.locator('#files .file-name')).toHaveText(['my-local.pdf']);
 await page.locator('[data-tool="edit"]').click();
 await expect(page.locator('#sample-trial')).toBeHidden();
});

test('A failed sample download can be retried without accepting a partial selection',async({page})=>{
 await page.route('**/examples/merge-second.pdf',route=>route.fulfill({status:503,body:'Unavailable'}));
 await page.goto(base+'/merge-pdf/');
 const trial=page.getByRole('button',{name:'Try sample PDFs',exact:true});
 await trial.click();
 await expect(page.locator('#status')).toContainText('Sample PDFs could not be loaded');
 await expect(page.locator('#files .file')).toHaveCount(0);
 await expect(page.getByTestId('run-tool')).toBeDisabled();
 await expect(trial).toBeEnabled();
 await page.unroute('**/examples/merge-second.pdf');
 await trial.click();
 await expect(page.locator('#files .file')).toHaveCount(2);
});

test('A delayed sample download does not replace a new local file selection',async({page})=>{
 const dir=await makeFixtureDir(),input=await createPdf(path.join(dir,'keep-local.pdf'),['LOCAL-TRIAL-RACE']);
 let release;const released=new Promise(resolve=>{release=resolve});
 await page.route('**/examples/merge-first.pdf',async route=>{await released;await route.continue()});
 await page.goto(base+'/merge-pdf/');
 const requested=page.waitForRequest('**/examples/merge-first.pdf');
 await page.getByRole('button',{name:'Try sample PDFs',exact:true}).click();
 await requested;
 await page.getByTestId('file-input').setInputFiles(input);
 const responded=page.waitForResponse('**/examples/merge-first.pdf');
 release();await responded;
 await expect(page.locator('#sample-trial button')).toBeEnabled();
 await expect(page.locator('#files .file-name')).toHaveText(['keep-local.pdf']);
 await expect(page.locator('#sample-trial')).toBeHidden();
});
