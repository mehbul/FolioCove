import {test,expect} from '@playwright/test';
import path from 'node:path';
import {makeFixtureDir,createPdf,runAndSaveDownload,pdfPageCount} from './helpers.mjs';
test.skip(!process.env.FOLIOCOVE_PAGES_TEST,'Only run against the Pages subpath server');
test('Pages subpath loads tools, navigation, PDF renderer and local worker downloads',async({page})=>{
 const failures=[];page.on('pageerror',e=>failures.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url())});
 await page.goto('/FolioCove/');await expect(page.locator('#core-tools a')).toHaveCount(35);
 await expect(page).toHaveTitle('FolioCove — Free, open-source PDF tools');
 await expect(page.locator('h1')).toHaveText('FolioCove PDF tools');
 await page.locator('.sidebar [data-tool="split"]').click();
 await expect(page.locator('#tool-title')).toHaveText('Extract pages');
 await expect(page).toHaveTitle('FolioCove — Free, open-source PDF tools');
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
 await expect(page.locator('.search-guide')).toContainText('No account is required');
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
