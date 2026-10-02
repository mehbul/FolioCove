import {test,expect} from '@playwright/test';
import {toolRegistry} from '../../src/content/tools.mjs';
test('tool knowledge is readable without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();await page.goto('/tools/');await expect(page.locator('.directory-list details')).toHaveCount(88);await page.locator('.directory-list summary').first().click();await expect(page.locator('.directory-list details').first()).toHaveAttribute('open','');const catalog=await (await page.request.get('/capabilities.json')).json();expect(catalog.tools).toHaveLength(88);expect(catalog.documentUploadEndpoint).toBeNull();await context.close();
});
test('stable tool links select actual workspaces and ignore unknown identifiers',async({page})=>{
 const registry=toolRegistry();for(const id of ['merge','docx','protect','createform','aisummary','sanitize']){await page.goto('/?tool='+id);await expect(page.getByTestId('tool-title')).toHaveText(registry[id].title);await expect(page.locator('.tool.active')).toHaveAttribute('data-tool',id);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');}
 await page.goto('/?tool=not-a-tool');await expect(page.getByTestId('tool-title')).toHaveText('Merge PDFs');
});
