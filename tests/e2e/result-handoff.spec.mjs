import {test,expect} from '@playwright/test';
import path from 'node:path';
import {createPdf,makeFixtureDir,runAndSaveDownload,pdfPageCount,pdfText,installPageGuards,expectNoGuardViolations} from './helpers.mjs';
const base=process.env.FOLIOCOVE_PAGES_TEST?'/ihatepdf':'';

test('A merged PDF passes through page organization and lossless compression without choosing files again',async({page})=>{
 const dir=await makeFixtureDir(),a=await createPdf(path.join(dir,'first.pdf'),['FLOW-A','FLOW-B']),b=await createPdf(path.join(dir,'second.pdf'),['FLOW-C']);
 const guards=installPageGuards(page,['FLOW-A','FLOW-B','FLOW-C']);
 await page.goto(base+'/merge-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();
 await page.getByTestId('file-input').setInputFiles([a,b]);const merged=await runAndSaveDownload(page,dir,'merged.pdf');
 expect(await pdfPageCount(merged)).toBe(3);
 const panel=page.getByRole('region',{name:'Prepared download'});
 const originalUrl=await panel.getByRole('link',{name:'Download again'}).getAttribute('href');
 await expect(panel.getByLabel('Next PDF tool')).toBeVisible();
 await panel.getByLabel('Next PDF tool').selectOption('visualorganize');
 await panel.getByRole('button',{name:'Use this PDF',exact:true}).click();
 await expect(page.getByTestId('tool-title')).toHaveText('Visual page organizer');await expect(page.getByTestId('tool-title')).toBeFocused();
 await expect(panel).toBeHidden();await expect(page.locator('#files .file-name')).toHaveText(['merged.pdf']);
 await expect(page.getByTestId('page-thumb')).toHaveCount(3);await expect(page.getByTestId('run-tool')).toBeEnabled();
 expect(await page.evaluate(async url=>{try{await fetch(url);return true}catch{return false}},originalUrl)).toBe(false);
 await page.getByTestId('page-thumb').first().getByRole('button',{name:'Delete page',exact:true}).click();
 await expect(page.getByTestId('page-thumb')).toHaveCount(2);
 const organized=await runAndSaveDownload(page,dir,'visually-organized.pdf');expect(await pdfPageCount(organized)).toBe(2);
 await panel.getByLabel('Next PDF tool').selectOption('lossless');await panel.getByRole('button',{name:'Use this PDF',exact:true}).click();
 await expect(page.getByTestId('tool-title')).toHaveText('Lossless PDF compression');
 await expect(page.locator('#files .file-name')).toHaveText(['visually-organized.pdf']);await expect(panel).toBeHidden();
 const compressed=await runAndSaveDownload(page,dir,'lossless.pdf');expect(await pdfPageCount(compressed)).toBe(2);
 const text=await pdfText(compressed);expect(text).not.toContain('FLOW-A');expect(text.indexOf('FLOW-B')).toBeGreaterThanOrEqual(0);expect(text.indexOf('FLOW-C')).toBeGreaterThan(text.indexOf('FLOW-B'));
 expectNoGuardViolations(guards);
});

test('Keyboard handoff on mobile opens extraction with the prepared file and fresh settings',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const dir=await makeFixtureDir(),a=await createPdf(path.join(dir,'a.pdf'),['MOBILE-A']),b=await createPdf(path.join(dir,'b.pdf'),['MOBILE-B','MOBILE-C']);
 await page.goto(base+'/merge-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles([a,b]);
 await runAndSaveDownload(page,dir,'merged.pdf');const panel=page.getByRole('region',{name:'Prepared download'});
 await panel.getByLabel('Next PDF tool').selectOption('split');await panel.getByRole('button',{name:'Use this PDF',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByTestId('tool-title')).toHaveText('Extract pages');await expect(page.getByTestId('tool-title')).toBeFocused();
 await expect(page.getByLabel('Pages to keep')).toHaveValue('1');await page.getByLabel('Pages to keep').fill('2-3');
 const output=await runAndSaveDownload(page,dir,'extracted-pages.pdf');expect(await pdfPageCount(output)).toBe(2);const text=await pdfText(output);expect(text).not.toContain('MOBILE-A');expect(text).toContain('MOBILE-B');expect(text).toContain('MOBILE-C');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByLabel('Pages to keep').fill('1');await expect(panel).toBeHidden();
});

test('Non-PDF downloads retain download recovery without offering PDF handoff',async({page})=>{
 const dir=await makeFixtureDir(),file=await createPdf(path.join(dir,'text.pdf'),['DOCX-ONLY']);
 await page.goto(base+'/pdf-to-word/');await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles(file);
 await runAndSaveDownload(page,dir,'document.docx');const panel=page.getByRole('region',{name:'Prepared download'});
 await expect(panel).toBeVisible();await expect(panel.getByRole('link',{name:'Download again'})).toBeVisible();await expect(panel.getByLabel('Next PDF tool')).toHaveCount(0);
});

test('A prepared PDF cannot change tools during a running job and disappears when inputs change',async({page})=>{
 await page.addInitScript(()=>{const original=File.prototype.arrayBuffer;File.prototype.arrayBuffer=async function(){if(window.__holdHandoffRead)await new Promise(resolve=>{window.__releaseHandoffRead=resolve});return original.call(this)};});
 const dir=await makeFixtureDir(),a=await createPdf(path.join(dir,'one.pdf'),['BUSY-A']),b=await createPdf(path.join(dir,'two.pdf'),['BUSY-B']);
 await page.goto(base+'/merge-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles([a,b]);await runAndSaveDownload(page,dir,'merged.pdf');
 const panel=page.getByRole('region',{name:'Prepared download'}),transfer=panel.getByRole('button',{name:'Use this PDF',exact:true});
 await expect(transfer).toBeEnabled();await page.evaluate(()=>{window.__holdHandoffRead=true});const pending=page.waitForEvent('download');await page.getByTestId('run-tool').click();
 await expect(transfer).toBeDisabled();await expect(panel.getByLabel('Next PDF tool')).toBeDisabled();await transfer.evaluate(button=>button.click());await expect(page.getByTestId('tool-title')).toHaveText('Merge PDFs');
 await page.evaluate(()=>{window.__holdHandoffRead=false;window.__releaseHandoffRead()});await pending;await expect(transfer).toBeEnabled();
 await page.locator('#files .remove').first().click();await expect(panel).toBeHidden();
});

test('Password-protected output is not offered to tools that require an unlocked PDF',async({page})=>{
 const dir=await makeFixtureDir(),file=await createPdf(path.join(dir,'public-fixture.pdf'),['PROTECTED-FIXTURE']);
 await page.goto(base+'/?tool=protect');await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles(file);
 await page.getByLabel('New password',{exact:true}).fill('fixture-password');await page.getByLabel('Confirm password',{exact:true}).fill('fixture-password');
 const output=await runAndSaveDownload(page,dir,'protect.pdf');const {readFile}=await import('node:fs/promises');expect((await readFile(output)).toString('latin1')).toContain('/Encrypt');
 const panel=page.getByRole('region',{name:'Prepared download'});await expect(panel.getByRole('link',{name:'Download again'})).toBeVisible();await expect(panel.getByLabel('Next PDF tool')).toHaveCount(0);
});
