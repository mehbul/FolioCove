// Rebuild public guide examples from synthetic text only. No document uploads.
// Run: node scripts/generate-guide-examples.mjs
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const folder=new URL('../src/static/examples/',import.meta.url);
const fixedDate=new Date('2026-10-08T00:00:00.000Z');
const records={};
await fs.mkdir(folder,{recursive:true});

function setMetadata(doc,title){
 doc.setTitle(title);doc.setAuthor('FolioCove');doc.setSubject('Synthetic PDF guide example; no customer data');
 doc.setCreator('FolioCove guide example generator');doc.setProducer('pdf-lib 1.17.1');
 doc.setCreationDate(fixedDate);doc.setModificationDate(fixedDate);
}

async function save(name,doc,labels){
 const bytes=await doc.save();
 const task=pdfjs.getDocument({data:new Uint8Array(bytes),standardFontDataUrl:fileURLToPath(new URL('../node_modules/pdfjs-dist/standard_fonts/',import.meta.url)).replaceAll('\\','/')});
 try{
  const parsed=await task.promise;
  if(parsed.numPages!==labels.length)throw Error(`${name}: unexpected page count`);
  for(let i=0;i<labels.length;i++){
   const text=(await(await parsed.getPage(i+1)).getTextContent()).items.map(item=>item.str).join(' ');
   const found=text.match(/FC-(?:MERGE-[AB]-[12]|EXTRACT-[1-6])/g);
   if(found?.length!==1||found[0]!==labels[i])throw Error(`${name}: unexpected content on page ${i+1}`);
  }
 }finally{await task.destroy();}
 await fs.writeFile(new URL(name,folder),bytes);
 records[name]={pages:labels.length,bytes:bytes.length,pageLabels:labels,sha256:createHash('sha256').update(bytes).digest('hex')};
 return bytes;
}

async function source(name,title,labels){
 const doc=await PDFDocument.create();setMetadata(doc,title);
 const font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 for(let i=0;i<labels.length;i++){
  const page=doc.addPage([420,540]);
  page.drawRectangle({x:0,y:452,width:420,height:88,color:rgb(.96,.91,.9)});
  page.drawText('FolioCove worked example',{x:30,y:495,size:19,font:bold,color:rgb(.2,.12,.15)});
  page.drawText(title,{x:30,y:467,size:12,font,color:rgb(.2,.12,.15)});
  page.drawText(labels[i],{x:30,y:391,size:24,font:bold,color:rgb(.15,.15,.15)});
  page.drawText(`Source page ${i+1} of ${labels.length}`,{x:30,y:357,size:13,font});
  page.drawText('This is a synthetic sample, with no personal information.',{x:30,y:315,size:11,font});
  page.drawText('Use the page label to check the order in your download.',{x:30,y:294,size:11,font});
  page.drawText('Keep the original samples and inspect the result.',{x:30,y:273,size:11,font});
 }
 return save(name,doc,labels);
}

const a=await source('merge-first.pdf','First merge document',['FC-MERGE-A-1']);
const b=await source('merge-second.pdf','Second merge document',['FC-MERGE-B-1','FC-MERGE-B-2']);
const merged=await PDFDocument.create();setMetadata(merged,'Merge example reference');
for(const bytes of [a,b]){
 const input=await PDFDocument.load(bytes,{updateMetadata:false});
 for(const page of await merged.copyPages(input,input.getPageIndices()))merged.addPage(page);
}
await save('merge-reference.pdf',merged,['FC-MERGE-A-1','FC-MERGE-B-1','FC-MERGE-B-2']);
const six=await source('extract-six-pages.pdf','Six-page extraction document',Array.from({length:6},(_,i)=>`FC-EXTRACT-${i+1}`));
const input=await PDFDocument.load(six,{updateMetadata:false}),extracted=await PDFDocument.create();setMetadata(extracted,'Pages 2-4 reference');
for(const page of await extracted.copyPages(input,[1,2,3]))extracted.addPage(page);
await save('extract-reference-2-4.pdf',extracted,['FC-EXTRACT-2','FC-EXTRACT-3','FC-EXTRACT-4']);
await fs.writeFile(new URL('manifest.json',folder),JSON.stringify({description:'Synthetic guide fixtures and reference outputs. Byte counts describe these downloads, not every browser-generated output.',generator:'scripts/generate-guide-examples.mjs',files:records},null,2)+'\n');
console.log('Generated and independently checked five synthetic PDF examples (page count, text labels and order).');
