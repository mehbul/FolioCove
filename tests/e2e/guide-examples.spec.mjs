import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {makeFixtureDir,pdfPageCount,pdfText,runAndSaveDownload} from './helpers.mjs';

test.skip(!process.env.FOLIOCOVE_PAGES_TEST,'Public examples are published only by the Pages build');

async function sampleDownload(page,dir,filename){
 const waiting=page.waitForEvent('download');
 await page.locator(`a[href="/FolioCove/examples/${filename}"]`).click();
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
 await page.goto('/FolioCove/guides/merge-pdfs-without-uploading/');
 await expect(page.getByRole('region',{name:'Worked merge example'})).toBeVisible();
 const first=await sampleDownload(page,dir,'merge-first.pdf'),second=await sampleDownload(page,dir,'merge-second.pdf');
 const reference=await sampleDownload(page,dir,'merge-reference.pdf');
 const expected=['FC-MERGE-A-1','FC-MERGE-B-1','FC-MERGE-B-2'];
 await checkLabels(reference,expected);
 const manifest=await(await page.request.get('/FolioCove/examples/manifest.json')).json();
 for(const filename of ['merge-first.pdf','merge-second.pdf','merge-reference.pdf']){
  expect((await fs.stat(path.join(dir,filename))).size).toBe(manifest.files[filename].bytes);
 }
 await page.getByRole('link',{name:'Merge PDFs',exact:true}).click();
 await page.getByTestId('file-input').setInputFiles([first,second]);
 const output=await runAndSaveDownload(page,dir,'merged.pdf');
 await checkLabels(output,expected);
});

test('The extraction guide range produces only the three documented sample pages',async({page})=>{
 const dir=await makeFixtureDir();
 await page.goto('/FolioCove/guides/extract-pages-from-pdf/');
 await page.setViewportSize({width:390,height:844});
 await expect(page.getByRole('region',{name:'Worked extraction example'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const input=await sampleDownload(page,dir,'extract-six-pages.pdf'),reference=await sampleDownload(page,dir,'extract-reference-2-4.pdf');
 const expected=['FC-EXTRACT-2','FC-EXTRACT-3','FC-EXTRACT-4'];
 await checkLabels(reference,expected);
 await page.getByRole('link',{name:'Extract pages',exact:true}).click();
 await page.getByTestId('file-input').setInputFiles(input);await page.locator('#pages').fill('2-4');
 const output=await runAndSaveDownload(page,dir,'extracted-pages.pdf');
 await checkLabels(output,expected);
});
