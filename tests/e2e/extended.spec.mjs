import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import {PDFDocument} from 'pdf-lib';
import {createPdf,makeFixtureDir,runAndSaveDownload,pdfText} from './helpers.mjs';
async function choose(page,id,file){await page.goto('/');await page.locator('#tool-filter').selectOption('all');await page.locator(`[data-tool="${id}"]`).click();await page.getByTestId('file-input').setInputFiles(file);}
test('local encryption rejects a wrong password and round trips document text',async({page})=>{
 const dir=await makeFixtureDir(),file=await createPdf(path.join(dir,'source.pdf'),['LOCAL-SECRET']);await choose(page,'protect',file);await page.locator('#local-password').fill('test-secret');await page.locator('#confirm-password').fill('test-secret');const locked=await runAndSaveDownload(page,dir,'protect.pdf');expect((await fs.readFile(locked)).toString('latin1')).toContain('/Encrypt');
 await choose(page,'unlock',locked);await page.locator('#local-password').fill('wrong');await page.getByTestId('run-tool').click();await expect(page.getByTestId('status')).toHaveClass(/error/);await expect(page.getByTestId('run-tool')).toBeEnabled();await page.locator('#local-password').fill('test-secret');const unlocked=await runAndSaveDownload(page,dir,'unlock.pdf');expect(await pdfText(unlocked)).toContain('LOCAL-SECRET');
});
test('form creation writes interactive fields and local shapes preserve document text',async({page})=>{
 const dir=await makeFixtureDir(),file=await createPdf(path.join(dir,'source.pdf'),['FORM-SOURCE']);await choose(page,'createform',file);const output=await runAndSaveDownload(page,dir,'createform.pdf');const doc=await PDFDocument.load(await fs.readFile(output));expect(doc.getForm().getTextField('Full Name')).toBeTruthy();expect(await pdfText(output)).toContain('FORM-SOURCE');
 await choose(page,'shapes',file);const shaped=await runAndSaveDownload(page,dir,'shapes.pdf');expect(await pdfText(shaped)).toContain('FORM-SOURCE');
});
test('visual comparison displays both local pages and unsupported AI fails clearly',async({page})=>{
 const dir=await makeFixtureDir(),a=await createPdf(path.join(dir,'a.pdf'),['FIRST']),b=await createPdf(path.join(dir,'b.pdf'),['SECOND']);await choose(page,'visualcompare',[a,b]);await page.getByTestId('run-tool').click();await expect(page.locator('#visual-panel canvas')).toHaveCount(2);await expect(page.getByTestId('status')).toHaveClass(/ok/);
 await choose(page,'aisummary',a);if(!await page.evaluate(()=>Boolean(globalThis.Summarizer))){await page.getByTestId('run-tool').click();await expect(page.getByTestId('status')).toContainText('does not support on-device AI');}
});
test('lossless compression and recovery preserve selectable text',async({page})=>{
 const dir=await makeFixtureDir(),file=await createPdf(path.join(dir,'source.pdf'),['PRESERVE-TEXT']);for(const id of ['lossless','recover']){await choose(page,id,file);const output=await runAndSaveDownload(page,dir,`${id}.pdf`);expect(await pdfText(output)).toContain('PRESERVE-TEXT');await expect(page.getByTestId('status')).toHaveClass(/ok/);}
});
test('drawn signature and image watermark produce readable local PDFs',async({page})=>{
 const dir=await makeFixtureDir(),file=await createPdf(path.join(dir,'source.pdf'),['INK-SOURCE']);await choose(page,'drawsign',file);const box=await page.locator('#ink-pad').boundingBox();await page.mouse.move(box.x+20,box.y+20);await page.mouse.down();await page.mouse.move(box.x+120,box.y+50,{steps:10});await page.mouse.up();const signed=await runAndSaveDownload(page,dir,'drawsign.pdf');expect(await pdfText(signed)).toContain('INK-SOURCE');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=20;c.getContext('2d').fillRect(0,0,20,20);return c.toDataURL('image/png').split(',')[1];}),image=path.join(dir,'watermark.png');await fs.writeFile(image,Buffer.from(png,'base64'));await choose(page,'imagewatermark',file);await page.locator('#watermark-image').setInputFiles(image);const stamped=await runAndSaveDownload(page,dir,'imagewatermark.pdf');expect(await pdfText(stamped)).toContain('INK-SOURCE');await expect(page.getByTestId('status')).toHaveClass(/ok/);
});
for(const [id,entry] of [['docx','word/document.xml'],['xlsx','xl/workbook.xml'],['pptx','ppt/slides/slide1.xml'],['jpg','page-001.jpg']])test(`${id} produces a genuine local output`,async({page})=>{
 const dir=await makeFixtureDir(),file=await createPdf(path.join(dir,'source.pdf'),['LOCAL-EXPORT']);await choose(page,id,file);const output=await runAndSaveDownload(page,dir,id==='jpg'?'pdf-jpg-pages.zip':`document.${id}`),zip=await JSZip.loadAsync(await fs.readFile(output));expect(zip.file(entry)).toBeTruthy();if(id==='docx')expect(await zip.file(entry).async('string')).toContain('LOCAL-EXPORT');if(id==='jpg'){const bytes=await zip.file(entry).async('uint8array');expect(Array.from(bytes.slice(0,3))).toEqual([255,216,255]);}
});

