import {test,expect} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import {PDFDocument,PDFName} from 'pdf-lib';
import {createDocumentPhoto,makeFixtureDir,runAndSaveDownload,pdfText,installPageGuards,expectNoGuardViolations} from './helpers.mjs';
const base=process.env.FOLIOCOVE_PAGES_TEST?'/ihatepdf':'';

test('ordered pictures retain per-image edits and export with paper, margins and page numbers',async({page})=>{
  const dir=await makeFixtureDir(),first=await createDocumentPhoto(path.join(dir,'page-10.png')),second=await createDocumentPhoto(path.join(dir,'page-2.png'));
  const guards=installPageGuards(page,[]);
  await page.goto(base+'/jpg-to-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();
  await page.getByTestId('file-input').setInputFiles([first,second]);
  await expect(page.locator('#files .file-name')).toHaveText(['page-10.png','page-2.png']);
  await page.getByLabel('Adjust image',{exact:true}).selectOption('1');
  await page.getByLabel('Filter',{exact:true}).selectOption('sepia');
  await page.getByLabel('Rotate clockwise',{exact:true}).selectOption('90');
  await page.getByText('Crop image',{exact:true}).click();
  await page.getByLabel('Crop right (%)',{exact:true}).fill('50');
  await page.getByRole('button',{name:'Reverse order',exact:true}).click();
  await expect(page.locator('#files .file-name')).toHaveText(['page-2.png','page-10.png']);
  await expect(page.getByLabel('Filter',{exact:true})).toHaveValue('sepia');
  await expect(page.getByLabel('Crop right (%)',{exact:true})).toHaveValue('50');
  await page.getByLabel('Paper size',{exact:true}).selectOption('a4');
  await page.getByLabel('Orientation',{exact:true}).selectOption('portrait');
  await page.getByLabel('Margin (mm)',{exact:true}).fill('12');
  await page.getByLabel('Add page numbers',{exact:true}).check();
  await page.getByLabel('Document title',{exact:true}).fill('Ordered photo check');
  await page.getByLabel('Download filename',{exact:true}).fill('ordered-check');
  const output=await runAndSaveDownload(page,dir,'ordered-check.pdf');
  const pdf=await PDFDocument.load(await fs.readFile(output));expect(pdf.getPageCount()).toBe(2);expect(pdf.getTitle()).toBe('Ordered photo check');
  for(const p of pdf.getPages()){expect(p.getWidth()).toBeCloseTo(595.28,1);expect(p.getHeight()).toBeCloseTo(841.89,1);}
  const text=await pdfText(output);expect(text).toContain('1 / 2');expect(text).toContain('2 / 2');
  await expect(page.getByRole('link',{name:'Download again',exact:true})).toBeVisible();
  await page.getByLabel('JPEG quality',{exact:true}).fill('80');
  await expect(page.getByRole('region',{name:'Prepared download'})).toBeHidden();
  expectNoGuardViolations(guards);
});

test('image-sized output reflects crop and rotation; invalid crop blocks export; mobile fits',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const dir=await makeFixtureDir(),file=await createDocumentPhoto(path.join(dir,'picture.png'));
  await page.goto(base+'/jpg-to-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles(file);
  await page.getByText('Crop image',{exact:true}).click();
  await page.getByLabel('Crop left (%)',{exact:true}).fill('60');await page.getByLabel('Crop right (%)',{exact:true}).fill('50');
  await page.getByTestId('run-tool').click();await expect(page.getByTestId('status')).toContainText('Crop right/bottom');
  await page.getByLabel('Crop left (%)',{exact:true}).fill('0');
  await page.getByLabel('Rotate clockwise',{exact:true}).selectOption('90');
  const output=await runAndSaveDownload(page,dir,'images.pdf');const pdf=await PDFDocument.load(await fs.readFile(output));
  expect(pdf.getPage(0).getWidth()).toBeCloseTo(34.56,1);expect(pdf.getPage(0).getHeight()).toBeCloseTo(23.04,1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Duplicate image',exact:true}).click();await expect(page.locator('#files .file-name')).toHaveCount(2);
  await page.getByRole('button',{name:'Reset image',exact:true}).click();await expect(page.getByLabel('Crop right (%)',{exact:true})).toHaveValue('100');
  await page.getByRole('button',{name:'Apply to all images',exact:true}).click();
  await page.getByLabel('Adjust image',{exact:true}).selectOption('1');await expect(page.getByLabel('Rotate clockwise',{exact:true})).toHaveValue('0');
});

test('every filter reaches the exported page image, and inversion changes the pixels',async({page})=>{
  const dir=await makeFixtureDir(),file=await createDocumentPhoto(path.join(dir,'filters.png'));
  await page.goto(base+'/jpg-to-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles(file);
  const colors={};
  for(const filter of ['original','grayscale','bw','scan','sepia']){
    await page.getByLabel('Filter',{exact:true}).selectOption(filter);
    const output=await runAndSaveDownload(page,dir,'images.pdf');
    const pdf=await PDFDocument.load(await fs.readFile(output));
    const objects=pdf.getPage(0).node.Resources().lookup(PDFName.of('XObject'));
    const stream=pdf.context.lookup(objects.entries()[0][1]);
    const encoded=Buffer.from(stream.getContents()).toString('base64');
    colors[filter]=await page.evaluate(async data=>{
      const image=new Image();image.src='data:image/jpeg;base64,'+data;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
      const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,sum=[0,0,0];
      for(let i=0;i<pixels.length;i+=4)for(let c=0;c<3;c++)sum[c]+=pixels[i+c];
      return sum.map(v=>v/(pixels.length/4));
    },encoded);
  }
  expect(Math.abs(colors.grayscale[0]-colors.grayscale[2])).toBeLessThan(2);
  expect(colors.sepia[0]).toBeGreaterThan(colors.sepia[2]+10);
  expect(colors.bw[0]).toBeCloseTo(colors.scan[0],0);
  await page.getByLabel('Invert colors',{exact:true}).check();
  await expect(page.locator('#ip-preview')).toHaveAttribute('src',/^data:image\/jpeg/);
  const inverted=await runAndSaveDownload(page,dir,'images.pdf');
  expect((await fs.stat(inverted)).size).toBeGreaterThan(1000);
});
