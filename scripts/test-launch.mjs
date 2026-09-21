import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as pdfLib from 'pdf-lib';
import JSZip from 'jszip';
import {core,notices,classifyOutcome,safeMetric} from '../dist/launch.mjs';
const html=fs.readFileSync('dist/index.html','utf8');
const scriptPath=html.match(/<script type="module" src="([^"]+)"><\/script>/)?.[1];
assert.equal(scriptPath,'/assets/app.js');
const script=fs.readFileSync(`dist${scriptPath}`,'utf8');
new vm.Script(fs.readFileSync('dist/sw.js','utf8'));
assert.equal(core.length,10);assert.equal(new Set(core.map(x=>x[1])).size,10);
for(const [,slug] of core){const page=fs.readFileSync(`dist/${slug}/index.html`,'utf8');assert(page.includes('<base href="/">'));assert(page.includes('noindex,nofollow'))}
for(const slug of ['privacy','security','limitations','terms','testing'])assert(fs.existsSync(`dist/${slug}/index.html`));
for(const route of [...core.map(x=>x[1]),'privacy','security','limitations','terms','testing'])assert(fs.existsSync(`dist/${route}/index.html`),`missing route ${route}`);
for(const file of ['dist/index.html','dist/assets/app.js','dist/assets/tesseract/worker.min.js','dist/launch.mjs']){
 const text=fs.readFileSync(file,'utf8');
 assert(!/CODEX_PRIMARY_RUNTIME_NODE_MODULES/.test(text),`${file} must not use Codex runtime dependencies`);
 assert(!/document-upload|upload endpoint|\/upload\b|fetch\(['"]https?:\/\/(?!tessdata\.projectnaptha\.com)/i.test(text),`${file} contains a blocked upload or third-party executable fetch marker`);
 assert(!/cdn\.jsdelivr\.net|cdn\.sheetjs\.com|unpkg\.com/.test(text),`${file} must not reference third-party JavaScript CDNs`);
}
assert.equal(classifyOutcome('status error'),'failure');assert.equal(classifyOutcome('status ok'),'completed');assert.equal(classifyOutcome('status'),null);
assert.deepEqual(Object.keys(safeMetric('merge','completed',123)),['tool','outcome','durationMs']);assert(notices.trimheads.includes('NOT redaction'));assert(notices.pdftoword.includes('not a native DOCX'));
const nodes=new Map();
class Element{
 constructor(id=''){this.id=id;this.value='';this.textContent='';this.className='';this.dataset={};this.style={};this.listeners=[];this.children=[];this.classList={add:()=>{},remove:()=>{},toggle:()=>{},contains:()=>false}}
 set innerHTML(v){this._html=v;for(const tag of v.matchAll(/<(?:input|select|textarea)[^>]*id="([^"]+)"[^>]*>/g)){const el=get(tag[1]);el.value=tag[0].match(/value="([^"]*)"/)?.[1]||'';el.checked=tag[0].includes('checked')}}get innerHTML(){return this._html||''}
 addEventListener(type,fn,capture=false){this.listeners.push({type,fn,capture})}querySelector(){return new Element()}append(...children){this.children.push(...children)}setAttribute(){}removeAttribute(){}click(){}
}
const get=id=>{if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id)};
const buttons=[...html.matchAll(/<button class="tool[^>]*data-tool="([^"]+)"/g)].map(m=>{const el=new Element();el.dataset.tool=m[1];return el});
const document={getElementById:get,querySelectorAll:()=>buttons,querySelector:s=>buttons.find(x=>s.includes(`"${x.dataset.tool}"`))||new Element(),createElement:()=>new Element(),dispatchEvent:()=>{}};
const context={document,localStorage:{getItem:()=>null,setItem:()=>{}},CustomEvent:class{},setTimeout,console,Blob,URL,Intl};
const body=script.split(/(?:const|var)\s+\{\s*initLaunch\s*\}\s*=\s*await\s+import\(["']\/launch\.mjs["']\)/)[0];
assert.notEqual(body,script,'test harness could not isolate the generated app bundle setup code');
for(const [key,value] of Object.entries(context))Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
const harnessModule=body+`\n const testApi={configs,setupTool,pageIndexes,set:(tool,input)=>{current=tool;selected=input;},getStatus:()=>({kind:status.className,text:status.textContent}),outputs:[],};download=(bytes,name)=>testApi.outputs.push({bytes,name});downloadBlob=(blob,name)=>testApi.outputs.push({blob,name});export {testApi};`;
const {testApi:api}=await import(`data:text/javascript;base64,${Buffer.from(harnessModule).toString('base64')}`);
assert.equal(Object.keys(api.configs).length,74);
api.setupTool('targetcompress');assert(get('options').innerHTML.includes('target-kb'));api.setupTool('sign');assert(get('options').innerHTML.includes('sign-name'));
assert.deepEqual(Array.from(api.pageIndexes('1-3, 5',5)),[0,1,2,4]);assert.throws(()=>api.pageIndexes('0',5));assert.throws(()=>api.pageIndexes('3-1',5));
const fixtures=[];
for(let n=0;n<10;n++){const doc=await pdfLib.PDFDocument.create();const count=n===0?1:n===9?50:5;for(let i=0;i<count;i++){const p=doc.addPage(n===2&&i%2?[400,300]:[595,842]);if(n!==4)p.drawText(`SYNTHETIC FIXTURE ${n} PAGE ${i+1}`,{x:30,y:200});if(n===3)p.setRotation(pdfLib.degrees(90))}if(n===5){const f=doc.getForm().createTextField('test');f.setText('Synthetic');f.addToPage(doc.getPage(0))}if(n===6)doc.setAuthor('Synthetic author');if(n===7)doc.getPage(0).drawRectangle({x:30,y:30,width:50,height:80});if(n===8)doc.setTitle('Synthetic metadata');fixtures.push(await doc.save())}
const asFile=(bytes)=>({name:'synthetic.pdf',size:bytes.length,type:'application/pdf',arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});
const asNamedFile=(bytes,name,type)=>({name,size:bytes.length,type,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),text:async()=>new TextDecoder().decode(bytes)});
const handlers=get('go').listeners.filter(x=>x.type==='click').sort((a,b)=>Number(b.capture)-Number(a.capture));
let runs=0;
async function executeWithFiles(tool,files){api.outputs.length=0;api.set(tool,files);get('status').textContent='';let stopped=false;for(const {fn} of handlers){await fn({stopImmediatePropagation:()=>{stopped=true}});if(stopped)break}return api.getStatus()}
async function execute(tool,bytes){return executeWithFiles(tool,tool==='merge'?[asFile(bytes),asFile(bytes)]:[asFile(bytes)])}
function worksheetXml(rows){const col=n=>String.fromCharCode(65+n),esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row,r)=>`<row r="${r+1}">${row.map((cell,c)=>{const ref=`${col(c)}${r+1}`;return typeof cell==='number'?`<c r="${ref}"><v>${cell}</v></c>`:`<c r="${ref}" t="inlineStr"><is><t>${esc(cell)}</t></is></c>`}).join('')}</row>`).join('')}</sheetData></worksheet>`}
async function xlsxFixture(){const zip=new JSZip();zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Summary" sheetId="1" r:id="rId1"/><sheet name="Detail" sheetId="2" r:id="rId2"/></sheets></workbook>');zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>');zip.file('xl/worksheets/sheet1.xml',worksheetXml([['Metric','Value'],['Revenue',42]]));zip.file('xl/worksheets/sheet2.xml',worksheetXml([['Region','Count'],['North',7]]));return new Uint8Array(await zip.generateAsync({type:'uint8array'}))}
for(const [index,bytes] of fixtures.entries()){
 for(const tool of ['merge','split','edit','sign','rotate','numbers','reverse']){
  get('pages').value='1';get('edit-page').value='1';get('edit-text').value='Synthetic note';get('edit-x').value='10';get('edit-y').value='10';get('sign-page').value='1';get('sign-name').value='Test User';get('sign-pos').value='left';get('angle').value='90';get('number-start').value='1';
  const state=await execute(tool,bytes);assert.equal(state.kind,'status ok',`${tool}/${index}: ${state.text}`);assert.equal(api.outputs.length,1);const out=await pdfLib.PDFDocument.load(api.outputs[0].bytes);assert.equal(out.getPageCount(),tool==='split'?1:(index===0?1:index===9?50:5)*(tool==='merge'?2:1));runs++;
 }
}
for(const tool of ['merge','split','edit','sign','rotate','numbers','reverse']){const state=await execute(tool,new TextEncoder().encode('not a PDF'));assert.equal(state.kind,'status error');assert.equal(api.outputs.length,0);runs++}
const spreadsheetBytes=await xlsxFixture();
const spreadsheetState=await executeWithFiles('exceltopdf',[asNamedFile(spreadsheetBytes,'synthetic.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')]);
assert.equal(spreadsheetState.kind,'status ok',`exceltopdf: ${spreadsheetState.text}`);
assert.equal(api.outputs.length,1);
assert.equal(api.outputs[0].name,'excel-to-pdf.pdf');
const spreadsheetPdf=await pdfLib.PDFDocument.load(api.outputs[0].bytes);
assert(spreadsheetPdf.getPageCount()>=1);
console.log(`PASS: syntax, 15 routes, metrics schema, route option initialization, page-range validation, spreadsheet-to-PDF replacement regression; ${runs} generated-bundle app-handler executions across 10 generated PDFs plus malformed input.`);
console.log('NOT TESTED: browser rendering, OCR, camera, compression, redaction accuracy, encrypted inputs, browser network traffic, Safari/mobile, human task completion.');
