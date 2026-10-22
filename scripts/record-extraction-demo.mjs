// Record the real workflow, crop to the workspace, then show the actual downloaded PDF.
// Requires ffmpeg/ffprobe and pdftoppm on PATH; run after build-pages.mjs.
import {chromium,expect} from '@playwright/test';
import {PDFDocument} from 'pdf-lib';
import {pdfText} from '../tests/e2e/helpers.mjs';
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
const runtime='.sites-runtime/extraction-demo',assets='src/static/demo';
await fs.mkdir(runtime,{recursive:true});
const run=(exe,args)=>new Promise((resolve,reject)=>{const p=spawn(exe,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});let err='';p.stderr.on('data',d=>err+=d);p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error(exe+': '+err.slice(-1500))))});
const server=spawn(process.execPath,['scripts/dev-server.mjs'],{env:{...process.env,PORT:'4175',FOLIOCOVE_BASE_PATH:'/ihatepdf'},stdio:'ignore',windowsHide:true});
let browser;
try{
 for(let n=0;n<100;n++){if(await fetch('http://127.0.0.1:4175/ihatepdf/').then(r=>r.ok).catch(()=>false))break;await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch();
 const context=await browser.newContext({viewport:{width:1000,height:800},recordVideo:{dir:runtime,size:{width:1000,height:800}},reducedMotion:'reduce'});
 const page=await context.newPage(),recordingStarted=Date.now();
 await page.goto('http://127.0.0.1:4175/ihatepdf/split-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();
 await page.evaluate(()=>scrollTo(0,document.querySelector('.workspace').getBoundingClientRect().top+scrollY));
 const box=await page.locator('.workspace').boundingBox(),cropX=Math.floor(box.x/2)*2,cropWidth=Math.floor((1000-cropX)/2)*2;
 const ready=(Date.now()-recordingStarted)/1000,marks=[];
 const mark=text=>marks.push({at:(Date.now()-recordingStarted)/1000-ready,text});
 mark('1. Choose a PDF from your device. This example uses six synthetic pages.');
 await page.screenshot({path:assets+'/extract-v2.poster.png',clip:{x:cropX,y:0,width:cropWidth,height:800}});await page.waitForTimeout(3000);
 await page.getByTestId('file-input').setInputFiles('src/static/examples/extract-six-pages.pdf');
 mark('2. The six-page sample is selected. Enter the pages you want to keep.');await page.waitForTimeout(2500);
 await page.locator('#pages').fill('2-4');mark('3. Enter 2-4 to keep pages two, three and four.');await page.waitForTimeout(3500);
 const waiting=page.waitForEvent('download');await page.getByTestId('run-tool').click();
 const output=runtime+'/extracted-pages.pdf';await(await waiting).saveAs(output);
 const pdf=await PDFDocument.load(await fs.readFile(output)),labels=(await pdfText(output)).match(/FC-EXTRACT-[1-6]/g);
 if(pdf.getPageCount()!==3||JSON.stringify(labels)!==JSON.stringify(['FC-EXTRACT-2','FC-EXTRACT-3','FC-EXTRACT-4']))throw Error('Wrong output pages');
 await page.getByRole('region',{name:'Prepared download'}).scrollIntoViewIfNeeded();
 mark('4. Download the extracted PDF. Keep the original and inspect the result.');await page.waitForTimeout(3500);
 // Render the actual output, not the reference fixture. This is explicitly a verification view.
 await run('pdftoppm.exe',['-png','-scale-to','580',output,runtime+'/actual-output']);
 const images=await Promise.all([1,2,3].map(async n=>'data:image/png;base64,'+(await fs.readFile(runtime+'/actual-output-'+n+'.png')).toString('base64')));
 await page.setContent(`<html><body style="margin:0;background:#f7f7f7;font-family:Arial;color:#222"><main style="position:absolute;left:${cropX}px;width:${cropWidth}px;box-sizing:border-box;padding:30px 18px"><p style="color:#a9223e;font-size:14px">Downloaded PDF preview · verification view</p><h1 style="font-size:28px;margin:16px 0">Six pages in. Three pages out.</h1><p style="font-size:17px;line-height:1.5">These are the actual pages from <strong>extracted-pages.pdf</strong>.</p><div style="display:flex;gap:12px;margin-top:36px">${images.map((src,i)=>`<figure style="margin:0;flex:1;min-width:0"><img src="${src}" style="width:100%;border:1px solid #ddd;box-shadow:0 3px 10px #0001"><figcaption style="font-size:17px;margin-top:15px;text-align:center">Source page ${i+2}</figcaption></figure>`).join('')}</div><p style="font-size:17px;margin-top:40px">Verified labels: FC-EXTRACT-2 · FC-EXTRACT-3 · FC-EXTRACT-4</p><p style="font-size:14px;color:#686868">Preview rendered from this recording’s download. Synthetic content only.</p></main></body></html>`);
 await page.locator('img').first().waitFor({state:'visible'});
 mark('5. Inspect the actual downloaded PDF: only source pages 2, 3 and 4 remain.');await page.waitForTimeout(6500);
 const end=(Date.now()-recordingStarted)/1000-ready;
 await page.screenshot({path:runtime+'/actual-output-preview.png',clip:{x:cropX,y:0,width:cropWidth,height:800}});
 const video=page.video();await context.close();const raw=runtime+'/workflow-raw.webm';await video.saveAs(raw);
 const filter=`crop=${cropWidth}:800:${cropX}:0`;
 await run('ffmpeg.exe',['-y','-loglevel','error','-ss',String(ready),'-i',raw,'-t',String(end),'-vf',filter,'-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',assets+'/extract-v2.mp4']);
 await run('ffmpeg.exe',['-y','-loglevel','error','-i',assets+'/extract-v2.mp4','-an','-c:v','libvpx','-deadline','realtime','-cpu-used','5','-crf','15','-b:v','1M',assets+'/extract-v2.webm']);
 const stamp=s=>{const ms=Math.max(0,Math.floor(s*1000));return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`};
 await fs.writeFile(assets+'/extract-v2.vtt','WEBVTT\n\n'+marks.map((m,i)=>`${stamp(m.at)} --> ${stamp(marks[i+1]?.at??end)}\n${m.text}\n`).join('\n'));
 await fs.writeFile(runtime+'/verification-v2.json',JSON.stringify({recordedAt:new Date().toISOString(),syntheticInput:true,pages:3,labels,duration:end,workspaceCrop:{x:cropX,width:cropWidth,height:800},captionCues:marks,outputPreview:'Rendered from the actual downloaded PDF; clearly labeled as a verification view',formats:['H.264 MP4','VP8 WebM']},null,2)+'\n');
 console.log('Recorded closer walkthrough, actual output preview, synchronized captions and MP4/WebM.');
}finally{await browser?.close();server.kill();}
