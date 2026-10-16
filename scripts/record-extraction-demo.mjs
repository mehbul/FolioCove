// Record the actual public-subpath workflow with synthetic inputs, never customer files.
// Run after build-pages.mjs. Deliberate pauses make the recording readable.
import {chromium,expect} from '@playwright/test';
import {PDFDocument} from 'pdf-lib';
import {pdfText} from '../tests/e2e/helpers.mjs';
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
const runtime='.sites-runtime/extraction-demo';
await fs.mkdir(runtime,{recursive:true});
const server=spawn(process.execPath,['scripts/dev-server.mjs'],{env:{...process.env,PORT:'4175',FOLIOCOVE_BASE_PATH:'/FolioCove'},stdio:'ignore',windowsHide:true});
let browser;
try{
 for(let n=0;n<100;n++){
  if(await fetch('http://127.0.0.1:4175/FolioCove/').then(r=>r.ok).catch(()=>false))break;
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 browser=await chromium.launch();
 const context=await browser.newContext({viewport:{width:1100,height:820},recordVideo:{dir:runtime,size:{width:1100,height:820}},reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:4175/FolioCove/split-pdf/');
 await expect(page.getByTestId('file-input')).toBeEnabled();
 await page.getByTestId('file-input').setInputFiles('src/static/examples/extract-six-pages.pdf');
 await page.locator('#pages').scrollIntoViewIfNeeded();await page.waitForTimeout(3000);
 await page.locator('#pages').fill('2-4');await page.waitForTimeout(4000);
 const waiting=page.waitForEvent('download');await page.getByTestId('run-tool').click();
 const output=runtime+'/extracted-pages.pdf';await(await waiting).saveAs(output);
 const pdf=await PDFDocument.load(await fs.readFile(output));
 if(pdf.getPageCount()!==3)throw new Error('Expected exactly three pages');
 const labels=(await pdfText(output)).match(/FC-EXTRACT-[1-6]/g);
 if(JSON.stringify(labels)!==JSON.stringify(['FC-EXTRACT-2','FC-EXTRACT-3','FC-EXTRACT-4']))throw new Error('Unexpected extracted page labels');
 await expect(page.getByRole('region',{name:'Prepared download'})).toBeVisible();
 await page.waitForTimeout(6000);
 const video=page.video();await context.close();
 await video.saveAs('src/static/demo/extract.webm');
 await fs.writeFile(runtime+'/verification.json',JSON.stringify({recordedAt:new Date().toISOString(),syntheticInput:true,pages:3,labels,output,scope:'Real extraction workflow; verified downloaded page count and text labels. Upload behavior is covered by separate network-guard tests, not measured by this recorder.'},null,2)+'\n');
 console.log('Recorded extraction demo; verified three pages labeled 2, 3, 4.');
}finally{await browser?.close();server.kill();}
