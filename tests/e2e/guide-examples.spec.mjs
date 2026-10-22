import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {makeFixtureDir,pdfPageCount,pdfText,runAndSaveDownload} from './helpers.mjs';

test.skip(!process.env.FOLIOCOVE_PAGES_TEST,'Public examples are published only by the Pages build');

test('Extraction demonstration connects the video, sample output and workspace',async({page})=>{
 await page.goto('/ihatepdf/demo/extract-pdf/');
 await expect(page.locator('h1')).toHaveText('Extract pages 2–4 from a PDF without uploading');
 await expect(page.getByRole('link',{name:'Extract pages now',exact:true})).toHaveAttribute('href','/ihatepdf/split-pdf/');
 await expect(page.locator('video')).toHaveAttribute('playsinline','');
 await expect(page.locator('video')).toHaveAttribute('poster','poster.png');
 await expect(page.locator('video source').first()).toHaveAttribute('src','extract-v2.mp4');
 const video=page.locator('video');
 await expect.poll(()=>video.evaluate(el=>el.readyState)).toBeGreaterThan(0);
 expect(await video.evaluate(el=>el.duration)).toBeGreaterThan(10);
 await video.evaluate(el=>el.play());
 await expect.poll(()=>video.evaluate(el=>el.currentTime)).toBeGreaterThan(0);
 for(const file of ['extract-v2.mp4','extract-v2.webm','poster.png','captions-v2.vtt'])expect((await page.request.get('/ihatepdf/demo/extract-pdf/'+file)).status()).toBe(200);
 const captions=await(await page.request.get('/ihatepdf/demo/extract-pdf/captions-v2.vtt')).text();
 const ends=[...captions.matchAll(/--> (\d\d):(\d\d):(\d\d\.\d\d\d)/g)].map(m=>Number(m[1])*3600+Number(m[2])*60+Number(m[3]));
 expect(Math.max(...ends)).toBeLessThanOrEqual(await video.evaluate(el=>el.duration)+0.5);
 await expect(page.locator('article')).toContainText('actual downloaded PDF');
 await expect(page.locator('article')).toContainText('FC-EXTRACT-2');
 await expect(page.locator('article')).toContainText('FC-EXTRACT-4');
 await page.goto('/ihatepdf/split-pdf/');
 await expect(page.getByRole('link',{name:'Watch the page extraction demo',exact:true})).toHaveAttribute('href','/ihatepdf/demo/extract-pdf/');
 await expect(page.getByRole('link',{name:'Share task feedback',exact:true})).toHaveAttribute('href','/ihatepdf/support/#task-feedback');
 await page.goto('/ihatepdf/support/#task-feedback');
 await expect(page.locator('#task-feedback')).toHaveText('Tell us how your task went');
 await expect(page.getByRole('link',{name:'Share a workflow report',exact:true})).toHaveAttribute('href','https://github.com/mehbul/ihatepdf/issues/new?template=feature.yml');
 await expect(page.locator('article')).toContainText('Nothing is sent automatically');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

async function sampleDownload(page,dir,filename){
 const waiting=page.waitForEvent('download');
 await page.locator(`a[href="/ihatepdf/examples/${filename}"]`).click();
 const downloaded=await waiting,file=path.join(dir,filename);await downloaded.saveAs(file);
 return file;
}

async function checkLabels(file,expected){
 expect(await pdfPageCount(file)).toBe(expected.length);
 const text=await pdfText(file);
 expect(text.match(/FC-(?:MERGE-[AB]-[12]|EXTRACT-[1-6])/g)).toEqual(expected);
}

test('A visitor can reproduce the published merge example and verify all page labels',async({page})=>{
 const dir=await makeFixtureDir();
 await page.goto('/ihatepdf/guides/merge-pdfs-without-uploading/');
 await expect(page.getByRole('region',{name:'Worked merge example'})).toBeVisible();
 const first=await sampleDownload(page,dir,'merge-first.pdf'),second=await sampleDownload(page,dir,'merge-second.pdf');
 const reference=await sampleDownload(page,dir,'merge-reference.pdf');
 const expected=['FC-MERGE-A-1','FC-MERGE-B-1','FC-MERGE-B-2'];
 await checkLabels(reference,expected);
 const manifest=await(await page.request.get('/ihatepdf/examples/manifest.json')).json();
 for(const filename of ['merge-first.pdf','merge-second.pdf','merge-reference.pdf']){
  expect((await fs.stat(path.join(dir,filename))).size).toBe(manifest.files[filename].bytes);
 }
 await page.getByRole('link',{name:'Merge PDFs',exact:true}).click();
 await expect(page.getByTestId('file-input')).toBeEnabled();
 await page.getByTestId('file-input').setInputFiles([first,second]);
 const output=await runAndSaveDownload(page,dir,'merged.pdf');
 await checkLabels(output,expected);
});

test('The extraction guide range produces only the three documented sample pages',async({page})=>{
 const dir=await makeFixtureDir();
 await page.goto('/ihatepdf/guides/extract-pages-from-pdf/');
 await page.setViewportSize({width:390,height:844});
 await expect(page.getByRole('region',{name:'Worked extraction example'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const input=await sampleDownload(page,dir,'extract-six-pages.pdf'),reference=await sampleDownload(page,dir,'extract-reference-2-4.pdf');
 const expected=['FC-EXTRACT-2','FC-EXTRACT-3','FC-EXTRACT-4'];
 await checkLabels(reference,expected);
 await page.getByRole('link',{name:'Extract pages',exact:true}).click();
 await expect(page.getByTestId('file-input')).toBeEnabled();
 await page.getByTestId('file-input').setInputFiles(input);await page.locator('#pages').fill('2-4');
 const output=await runAndSaveDownload(page,dir,'extracted-pages.pdf');
 await checkLabels(output,expected);
});
