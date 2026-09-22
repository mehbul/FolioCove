// Audit-only synthetic fixtures; does not modify application source.
import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
import {PDFDocument, PDFName, PDFString, StandardFonts} from 'pdf-lib';
const origin='http://127.0.0.1:4177';
const browser=await chromium.launch();
const context=await browser.newContext({acceptDownloads:true});
const page=await context.newPage();
const requests=[];
await context.route('**/*',async route=>{
  const req=route.request();
  requests.push({url:req.url(),method:req.method()});
  if(req.url().startsWith(origin)||req.url().startsWith('data:')||req.url().startsWith('blob:'))await route.continue();
  else await route.abort();
});
async function tool(id){await page.goto(origin);await page.locator('#boot-state').waitFor({state:'hidden'});await page.locator('#tool-filter').selectOption('all');await page.locator(`[data-tool="${id}"]`).click();}
async function run(bytes,name='synthetic.pdf',mimeType='application/pdf',downloadTimeout=20000){
  await page.locator('#picker').setInputFiles({name,mimeType,buffer:Buffer.from(bytes)});
  const downloadPromise=page.waitForEvent('download',{timeout:downloadTimeout}).catch(()=>null);
  await page.locator('#go').click();
  const download=await downloadPromise;
  return {bytes:download?await fs.readFile(await download.path()):null,name:download?.suggestedFilename(),status:await page.locator('#status').textContent()};
}
const evidence={browser:browser.version(),cases:{}};
try{
  const doc=await PDFDocument.create();const p=doc.addPage([420,540]);p.drawText('Public visible material',{x:30,y:400});
  doc.setAuthor('PRIVATE_AUTHOR');
  const xmp=doc.context.stream('<x:xmpmeta xmlns:x="adobe:ns:meta/">PRIVATE_XMP_MARKER</x:xmpmeta>',{Type:'Metadata',Subtype:'XML'});
  doc.catalog.set(PDFName.of('Metadata'),doc.context.register(xmp));
  const field=doc.getForm().createTextField('Private field');field.setText('PRIVATE_FORM_MARKER');field.addToPage(p);
  const action=doc.context.register(doc.context.obj({S:PDFName.of('JavaScript'),JS:PDFString.of('PRIVATE_ACTION_MARKER')}));
  doc.catalog.set(PDFName.of('OpenAction'),action);
  const bytes=await doc.save();
  for(const id of ['privacycheck','sanitize','clean']){
    await tool(id);const result=await run(bytes,'synthetic.pdf','application/pdf',id==='clean'?20000:1500);
    if(!result.bytes){evidence.cases[id]={name:result.name,status:result.status,downloaded:false};continue}
    const out=await PDFDocument.load(result.bytes);
    const outputObjects=out.context.enumerateIndirectObjects().map(([ref,obj])=>obj.toString()).join('\n');
    const metadata=out.catalog.lookup(PDFName.of('Metadata'));
    evidence.cases[id]={name:result.name,status:result.status,downloaded:true,author:out.getAuthor(),catalogMetadata:!!metadata,xmp:metadata?.getContentsString(),fields:out.getForm().getFields().map(f=>({name:f.getName(),value:f.getText?.()})),openAction:out.catalog.has(PDFName.of('OpenAction')),orphanAction:outputObjects.includes(Buffer.from('PRIVATE_ACTION_MARKER').toString('hex').toUpperCase())||outputObjects.includes('PRIVATE_ACTION_MARKER')};
  }
  const formulaDoc=await PDFDocument.create();formulaDoc.addPage().drawText('=1+1',{x:30,y:300,font:await formulaDoc.embedFont(StandardFonts.Helvetica)});
  await tool('pdftoexcel');const formulaResult=await run(await formulaDoc.save());evidence.cases.csv={status:formulaResult.status,csv:formulaResult.bytes.toString()};
  const contactsDoc=await PDFDocument.create();contactsDoc.addPage().drawText('audit@example.com +15551234567 https://x.io/"q',{x:30,y:300,font:await contactsDoc.embedFont(StandardFonts.Helvetica)});
  await tool('contacts');const contactsResult=await run(await contactsDoc.save());evidence.cases.contacts={status:contactsResult.status,csv:contactsResult.bytes.toString()};
  await tool('redact');await page.locator('#redact-page').fill('99');const redacted=await run(await formulaDoc.save(),'synthetic.pdf','application/pdf',1500);evidence.cases.redactInvalidPage={status:redacted.status,download:redacted.name,downloaded:!!redacted.bytes};
  await tool('htmltopdf');const requestStart=requests.length;
  const html='<p>SYNTHETIC_HTML_MARKER</p><img src="https://example.invalid/SYNTHETIC_HTML_MARKER"><iframe src="https://example.invalid/SYNTHETIC_IFRAME_MARKER"></iframe><script>window.auditXSS=true</script>';
  const htmlResult=await run(Buffer.from(html),'synthetic.html','text/html');
  evidence.cases.html={status:htmlResult.status,download:htmlResult.name,requests:requests.slice(requestStart),scriptExecuted:await page.evaluate(()=>!!window.auditXSS)};
  evidence.externalRequests=requests.filter(r=>!r.url.startsWith(origin)&&!r.url.startsWith('blob:')&&!r.url.startsWith('data:'));
  evidence.storage=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
  await fs.writeFile(new URL('./security-probe-results.json',import.meta.url),JSON.stringify(evidence,null,2));
  console.log(JSON.stringify(evidence,null,2));
}finally{await context.close();await browser.close();}
