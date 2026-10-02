import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from '@playwright/test';
import {PDFDocument,StandardFonts} from 'pdf-lib';
import {Document,Paragraph,Packer} from 'docx';
import * as XLSX from '@e965/xlsx';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import {createPdfToolkit} from 'pdfstudio';
import {installPageGuards} from '../tests/e2e/helpers.mjs';
const dir=path.resolve('test-results/launch-catalog');await fs.mkdir(dir,{recursive:true});
const marker='FOLIOCOVE-LOCAL-AUDIT-74291',doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);
for(let n=1;n<=3;n++){const p=doc.addPage([420,540]);p.drawText(`${marker} PAGE ${n}`,{x:25,y:450,size:12,font});p.drawText('Project invoice. Contact audit@example.test. Payment due Friday.',{x:25,y:400,size:10,font});}
doc.getForm().createTextField('Full Name').addToPage(doc.getPage(0),{x:25,y:300,width:200,height:30});doc.setTitle('Synthetic audit');
const pdfPath=path.join(dir,'audit-marker-74291.pdf');await fs.writeFile(pdfPath,await doc.save());
const docx=path.join(dir,'input.docx');await fs.writeFile(docx,await Packer.toBuffer(new Document({sections:[{children:[new Paragraph(marker)]}]})));
const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([['Name','Amount'],[marker,42]]),'Sample');const xlsx=path.join(dir,'input.xlsx');await fs.writeFile(xlsx,XLSX.write(book,{type:'buffer',bookType:'xlsx'}));
const slides=new PptxGenJS();slides.addSlide().addText(marker,{x:1,y:1,w:8,h:1});const pptx=path.join(dir,'input.pptx');await slides.writeFile({fileName:pptx});
const html=path.join(dir,'input.html');await fs.writeFile(html,`<h1>${marker}</h1><p>Local example text.</p>`);
const rtf=path.join(dir,'input.rtf');await fs.writeFile(rtf,`{\\rtf1\\ansi ${marker}}`);
const toolkit=await createPdfToolkit({wasmModule:await WebAssembly.compile(await fs.readFile('node_modules/pdfstudio/dist/wasm/qpdf.wasm'))});const locked=path.join(dir,'locked.pdf');await fs.writeFile(locked,await toolkit.lock(await fs.readFile(pdfPath),{userPassword:'audit-password'}));
const browser=await chromium.launch(),page=await browser.newPage({acceptDownloads:true});const guards=installPageGuards(page,[marker,'audit-marker-74291.pdf']);
await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>document.querySelectorAll('.tool').length===88);
const image=path.join(dir,'image.png');await fs.writeFile(image,Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=300;const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,300,300);ctx.fillStyle='black';ctx.font='24px sans-serif';ctx.fillText('LOCAL AUDIT',20,100);return c.toDataURL('image/png').split(',')[1];}),'base64'));
const tools=await page.locator('.tool').evaluateAll(nodes=>nodes.map(el=>({id:el.dataset.tool,label:el.textContent.trim()})));const results=[];
const inputs={'edit-text':'Audit note','sign-name':'Audit Signer','header-text':'Audit header','find-query':'Project','quick-command':'rotate 90, add page numbers','qr-value':'AUDIT-REFERENCE','form-values':'Full Name = Test Person','pdf-question':'When is payment due?','field-name':'New field','local-password':'audit-password','confirm-password':'audit-password'};
for(const tool of tools){
 let downloads=[];const listener=d=>downloads.push(d);page.on('download',listener);
 try{
  await page.locator(`[data-tool="${tool.id}"]`).click();await page.getByTestId('file-input').setInputFiles(['images','camerascanner'].includes(tool.id)?image:tool.id==='wordtopdf'?docx:tool.id==='exceltopdf'?xlsx:tool.id==='ppttopdf'?pptx:tool.id==='htmltopdf'?html:tool.id==='opendoc'?rtf:tool.id==='unlock'?locked:['merge','interleave','compare','visualcompare'].includes(tool.id)?[pdfPath,pdfPath]:pdfPath);
  for(const [id,value] of Object.entries(inputs)){const el=page.locator('#'+id);if(await el.count())await el.fill(value);}
  if(tool.id==='visualorganize')await page.locator('.thumb').first().waitFor();
  if(tool.id==='imagewatermark')await page.locator('#watermark-image').setInputFiles(image);
  if(tool.id==='drawsign'){await page.locator('#ink-pad').scrollIntoViewIfNeeded();const box=await page.locator('#ink-pad').boundingBox();await page.mouse.move(box.x+10,box.y+20);await page.mouse.down();await page.mouse.move(box.x+100,box.y+40,{steps:5});await page.mouse.up();}
  const start=Date.now();await page.locator('#go').click();await page.waitForFunction(()=>!document.getElementById('go').disabled&&document.getElementById('status').textContent.trim(),{},{timeout:30000});
  const state=await page.locator('#status').evaluate(el=>({class:el.className,text:el.textContent}));let parsed=[];
  for(const [i,download] of downloads.entries()){const name=download.suggestedFilename(),target=path.join(dir,`${tool.id}-${i}-${name}`);await download.saveAs(target);const bytes=await fs.readFile(target);if(name.endsWith('.pdf')){if(tool.id==='protect'){parsed.push({format:'PDF',encrypted:(await toolkit.requiresPassword(bytes))});}else parsed.push({format:'PDF',pages:(await PDFDocument.load(bytes)).getPageCount()});}else if(/\.(zip|docx|xlsx|pptx)$/.test(name)){const zip=await JSZip.loadAsync(bytes);parsed.push({format:path.extname(name),entries:Object.keys(zip.files).length});}else parsed.push({format:path.extname(name),bytes:bytes.length});}
  const expected=tool.id==='sanitize'||(['aisummary','translate'].includes(tool.id)&&state.class.includes('error'));
  const outcome=state.class.includes('error')?(expected?'expected-limitation':'failed'):downloads.length?'output-parseable':'status-only';results.push({...tool,outcome,seconds:(Date.now()-start)/1000,state,outputs:parsed});
 }catch(error){results.push({...tool,outcome:'audit-error',error:error.message.split('\n')[0]});await page.reload();await page.waitForFunction(()=>document.querySelectorAll('.tool').length===88);}
 finally{page.off('download',listener);}
 console.log(tool.id,results.at(-1).outcome);
}
const report={date:'2026-10-02',scope:'One synthetic representative input per catalog tool; parseability does not establish fidelity or edge-case correctness.',results,pageErrors:guards.pageErrors,networkViolations:guards.networkViolations};
await fs.writeFile(path.join(dir,'report.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(results.reduce((acc,r)=>(acc[r.outcome]=(acc[r.outcome]||0)+1,acc),{})));
