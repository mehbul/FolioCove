import {test,expect} from '@playwright/test';
import path from 'node:path';
import {makeFixtureDir,createPdf,runAndSaveDownload,pdfPageCount,pdfText} from './helpers.mjs';
import {core} from '../../src/content/routes.mjs';
test.skip(!process.env.FOLIOCOVE_PAGES_TEST,'Only run against the Pages subpath server');

test('PDF task links and matching metadata are available without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false});
 try{
  const page=await context.newPage();await page.goto('/FolioCove/');
  await expect(page.getByRole('navigation',{name:'PDF task links'}).locator('a')).toHaveCount(core.length);
  const title=await page.title(),description=await page.locator('meta[name=description]').getAttribute('content');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',title);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content',description);
  const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  const app=schema['@graph'].find(x=>x['@type']==='WebApplication');
  expect(app.description).toBe(description);expect(app.isAccessibleForFree).toBe(true);
  for(const [,slug] of core){
   await expect(page.getByRole('navigation',{name:'PDF task links'}).locator(`a[href="/FolioCove/${slug}/"]`)).toHaveCount(1);
  }
  await page.getByRole('navigation',{name:'PDF task links'}).getByRole('link',{name:'Extract pages',exact:true}).click();
  await expect(page.locator('h1')).toHaveText('Extract PDF pages free on your device');
  await expect(page).toHaveTitle('Extract PDF pages free on your device — FolioCove');
  await expect(page.locator('.intro p')).toContainText('pages');
  await page.goto('/FolioCove/testing/');
  await expect(page.locator('article')).toContainText('FolioCove is available as a public beta');
  await expect(page.locator('article')).not.toContainText('Public launch is pending');
 }finally{await context.close();}
});
test('Pages subpath loads tools, navigation, PDF renderer and local worker downloads',async({page})=>{
 const failures=[];page.on('pageerror',e=>failures.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url())});
 await page.goto('/FolioCove/');await expect(page.locator('#core-tools a')).toHaveCount(35);
 await expect(page).toHaveTitle('FolioCove — Free PDF tools to merge, split & compress');
 await expect(page.locator('h1')).toHaveText('FolioCove PDF tools');
 await page.locator('.sidebar [data-tool="split"]').click();
 await expect(page.locator('#tool-title')).toHaveText('Extract pages');
 await expect(page).toHaveTitle('FolioCove — Free PDF tools to merge, split & compress');
 await expect(page.locator('.brand')).toContainText('PUBLIC BETA');
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','index,follow');
 await expect(page.locator('meta[name=google-site-verification]')).toHaveAttribute('content','DvS9BP2Rzh2vGhwIWFxLYanLAzH4cOliBGzBFmZpxzY');
 expect((await page.request.get('/FolioCove/sitemap.xml')).status()).toBe(200);
 const sitemap=await (await page.request.get('/FolioCove/sitemap.xml')).text();
 expect(sitemap).toContain('https://mehbul.github.io/FolioCove/merge-pdf/');
 await page.goto('/FolioCove/demo/');
 await expect(page.locator('video')).toBeVisible();
 expect((await page.request.get('/FolioCove/demo/merge.webm')).headers()['content-type']).toContain('video/webm');
 await page.goto('/FolioCove/');
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://mehbul.github.io/FolioCove/');
 await page.goto('/FolioCove/tools/');await expect(page.locator('.directory-list details')).toHaveCount(88);
 await page.goto('/FolioCove/merge-pdf/');await expect(page.locator('#tool-title')).toHaveText('Merge PDFs');
 const dir=await makeFixtureDir(),a=await createPdf(path.join(dir,'a.pdf'),['FIRST']),b=await createPdf(path.join(dir,'b.pdf'),['SECOND']);
 await page.getByTestId('file-input').setInputFiles([a,b]);expect(await pdfPageCount(await runAndSaveDownload(page,dir,'merged.pdf'))).toBe(2);
 await page.goto('/FolioCove/?tool=lossless');
 await expect(page.getByTestId('file-input')).toBeEnabled();
 await page.getByTestId('file-input').setInputFiles(a);expect(await pdfPageCount(await runAndSaveDownload(page,dir,'lossless.pdf'))).toBe(1);
 await page.goto('/FolioCove/organize-pdf/');
 await expect(page.locator('#tool-title')).toHaveText('Visual page organizer');
 await page.getByTestId('file-input').setInputFiles(a);
 await expect(page.getByTestId('page-thumb').locator('canvas').first()).toBeVisible();
 expect(failures).toEqual([]);
});
test('Public PDF guides link to functioning workspaces and expose truthful crawlable content',async({page})=>{
 await page.goto('/FolioCove/');
 await page.locator('.search-guide').getByRole('link',{name:'How to merge PDFs without uploading your files'}).click();
 await expect(page.locator('h1')).toHaveText('How to merge PDFs without uploading your files');
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','index,follow');
 await page.getByRole('link',{name:'Merge PDFs',exact:true}).click();
 await expect(page.getByTestId('tool-title')).toHaveText('Merge PDFs');
 await expect(page.getByRole('region',{name:'Merge PDFs guide',exact:true})).toContainText('No account is required');
 const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
 expect(schema['@graph'].find(x=>x['@type']==='WebApplication').isAccessibleForFree).toBe(true);
 for(const slug of ['extract-pages-from-pdf','reduce-pdf-size']){
  await page.goto('/FolioCove/guides/'+slug+'/');
  await expect(page.locator('article')).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 const sitemap=await(await page.request.get('/FolioCove/sitemap.xml')).text();
 expect(sitemap).toContain('https://mehbul.github.io/FolioCove/guides/reduce-pdf-size/');
});
test('Comparison blog is discoverable, sourced and usable on mobile',async({page})=>{
 await page.goto('/FolioCove/');
 await page.getByRole('link',{name:'A free iLovePDF alternative for on-device PDF tasks',exact:true}).click();
 await expect(page.locator('h1')).toContainText('iLovePDF alternative');
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://mehbul.github.io/FolioCove/blog/ilovepdf-alternative/');
 await expect(page.locator('article')).toContainText('not affiliated with iLovePDF');
 await expect(page.locator('article a[href="https://www.ilovepdf.com/help/privacy"]')).toHaveCount(1);
 await expect(page.locator('article')).toContainText('redaction is experimental');
 const schemas=await page.locator('script[type="application/ld+json"]').allTextContents();
 expect(schemas.map(x=>JSON.parse(x)).find(x=>x['@type']==='BlogPosting').headline).toBe(await page.locator('h1').textContent());
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const slug of ['pdf-tools-privacy','open-source-pdf-tools']){
  await page.goto('/FolioCove/blog/'+slug+'/');await expect(page.locator('article')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto('/FolioCove/blog/');await expect(page.locator('h1')).toHaveText('PDF comparisons & privacy');
});

test('Merge and extraction help remains useful without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:390,height:844}});
 try{
  const page=await context.newPage();
  for(const [slug,region,sample] of [['merge-pdf','Merge PDF questions','merge-first.pdf'],['split-pdf','Extract PDF questions','extract-six-pages.pdf']]){
   await page.goto('/FolioCove/'+slug+'/');
   const help=page.getByRole('region',{name:region});await expect(help).toBeVisible();
   await expect(help.locator(`a[href="/FolioCove/examples/${sample}"]`)).toHaveCount(1);
   expect((await page.request.get('/FolioCove/examples/'+sample)).status()).toBe(200);
   const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
   const app=schema['@graph'].find(x=>x['@type']==='WebApplication');
   expect(app.name).toMatch(/^FolioCove PDF tools — /);
   expect(app.description).toBe(await page.locator('meta[name=description]').getAttribute('content'));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await expect(page.getByRole('table')).toContainText('6,2-4');
 }finally{await context.close();}
});

test('Direct task pages avoid hidden previews and honor the published page selections',async({page})=>{
 const previews=[],failures=[];page.on('request',r=>{if(r.url().includes('/previews/'))previews.push(r.url())});page.on('pageerror',e=>failures.push(e.message));
 await page.setViewportSize({width:390,height:844});
 await page.goto('/FolioCove/merge-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();
 await expect(page.locator('#core-tools a')).toHaveCount(0);
 await page.goto('/FolioCove/split-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();
 const dir=await makeFixtureDir(),input=await createPdf(path.join(dir,'six-pages.pdf'),[1,2,3,4,5,6].map(n=>'FC-EXTRACT-'+n));
 await page.getByTestId('file-input').setInputFiles(input);
 for(const [range,expected] of [['2-4',[2,3,4]],['1,4-6',[1,4,5,6]],['6,2-4',[6,2,3,4]],['2-4,3',[2,3,4]]]){
  await page.getByLabel('Pages to keep').fill(range);
  const output=await runAndSaveDownload(page,dir,'extracted-pages.pdf');
  expect(await pdfPageCount(output)).toBe(expected.length);
  expect((await pdfText(output)).match(/FC-EXTRACT-\d/g)).toEqual(expected.map(n=>'FC-EXTRACT-'+n));
 }
 await page.getByLabel('Pages to keep').fill('4-2');await page.getByTestId('run-tool').click();
 await expect(page.getByTestId('status')).toContainText('Choose pages between 1 and 6');
 await page.getByLabel('Pages to keep').fill('1');expect(await pdfPageCount(await runAndSaveDownload(page,dir,'extracted-pages.pdf'))).toBe(1);
 expect(previews).toEqual([]);expect(failures).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
