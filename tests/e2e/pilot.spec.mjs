import {test,expect} from '@playwright/test';
test('pilot: camera input requests rear capture and empty selection leaves processing disabled',async({page})=>{
 await page.goto('/scan-pdf/');const picker=page.getByTestId('file-input');await expect(picker).toHaveAttribute('capture','environment');await expect(picker).toHaveAttribute('accept','image/jpeg,image/png,image/webp');await picker.setInputFiles([]);await expect(page.getByTestId('run-tool')).toBeDisabled();await page.locator('[data-tool="merge"]').click();await expect(picker).not.toHaveAttribute('capture',/.+/);
});
test('pilot: unreadable photo reports an error without a download',async({page})=>{
 await page.goto('/scan-pdf/');let downloads=0;page.on('download',()=>downloads++);await page.getByTestId('file-input').setInputFiles({name:'broken.jpg',mimeType:'image/jpeg',buffer:Buffer.from('invalid photo')});await page.getByTestId('run-tool').click();await expect(page.getByTestId('status')).toHaveClass(/error/);await expect(page.getByTestId('run-tool')).toBeEnabled();expect(downloads).toBe(0);
});
test('pilot: capability limits are visible before running a tool',async({page})=>{
 await page.goto('/');await expect(page.locator('.capability-note')).toContainText('Verified sanitization and PDF/A conversion are unavailable');await expect(page.locator('[data-tool-card="aisummary"] .cover-badge')).toContainText('Browser dependent');await expect(page.locator('a[href="/redact-pdf/"] .cover-badge')).toContainText('Experimental');
 for(const [id,copy] of [['aisummary','Browser-dependent'],['translate','not available in every browser'],['redact','Experimental raster redaction'],['sanitize','will not create a PDF download']]){await page.locator(`[data-tool="${id}"]`).click();await expect(page.getByTestId('tool-limit')).toContainText(copy);expect(await page.getByTestId('tool-limit').evaluate(el=>Boolean(el.compareDocumentPosition(document.getElementById('go'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);}
 await page.goto('/limitations/');await expect(page.locator('body')).toContainText('Validated archival PDF/A conversion is unavailable.');
});
