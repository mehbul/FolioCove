// Record a real synthetic-file workflow. Run after build-pages.mjs.
import {chromium} from '@playwright/test';
import {PDFDocument} from 'pdf-lib';
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
const runtime='.sites-runtime/demo';
await fs.mkdir(runtime,{recursive:true});
await fs.mkdir('src/static/demo',{recursive:true});
for(const name of ['sample-one','sample-two']){
 const pdf=await PDFDocument.create();pdf.addPage().drawText('Synthetic FolioCove demo: '+name);
 await fs.writeFile(`${runtime}/${name}.pdf`,await pdf.save());
}
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
 await page.goto('http://127.0.0.1:4175/FolioCove/');await page.waitForTimeout(5000);
 await page.goto('http://127.0.0.1:4175/FolioCove/merge-pdf/');await page.waitForTimeout(5000);
 await page.getByTestId('file-input').setInputFiles([`${runtime}/sample-one.pdf`,`${runtime}/sample-two.pdf`]);await page.waitForTimeout(8000);
 const download=page.waitForEvent('download');await page.getByTestId('run-tool').click();
 const result=await download;await result.saveAs(`${runtime}/merged.pdf`);
 if((await PDFDocument.load(await fs.readFile(`${runtime}/merged.pdf`))).getPageCount()!==2)throw new Error('Demo output must have two pages');
 await page.waitForTimeout(10000);
 const video=page.video();await context.close();await video.saveAs('src/static/demo/merge.webm');
 console.log('Recorded real merge demo; verified two-page download.');
}finally{await browser?.close();server.kill();}
