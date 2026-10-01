import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
await fs.mkdir('.impeccable/review', { recursive: true });
const browser = await chromium.launch();
for (const [name, width, height] of [['desktop',1440,1080],['mobile',390,844]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#core-tools a').first().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))));
  await page.screenshot({path:`.impeccable/review/${name}.png`,fullPage:true});
  console.log(name,JSON.stringify(await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,font:getComputedStyle(document.querySelector('h1')).fontFamily,cards:document.querySelectorAll('#core-tools a').length,missingImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)}))),errors);
  await page.locator('[data-category="edit"]').click();
  if(await page.locator('#core-tools a:visible').count()!==2)throw Error('Edit category did not filter to two tools');
  await page.locator('[data-category="all"]').click();
  await page.locator('#discover-search').fill('merge');
  if(await page.locator('#core-tools a:visible').count()!==1)throw Error('Tool search failed');
  await page.locator('#discover-search').fill('no matching tool');
  if(!await page.locator('#empty-browse').isVisible())throw Error('No-result feedback missing');
  await page.goto('http://127.0.0.1:4173/merge-pdf/');
  await page.locator('#tool-title').waitFor();
  await page.screenshot({path:`.impeccable/review/${name}-workspace.png`,fullPage:true});
  await page.close();
}
await browser.close();
