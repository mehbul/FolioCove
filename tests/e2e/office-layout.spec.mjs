import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import {PDFDocument,PDFName} from 'pdf-lib';
import {createPdf,makeFixtureDir,runAndSaveDownload} from './helpers.mjs';
const base=process.env.FOLIOCOVE_PAGES_TEST?'/ihatepdf':'';
test('Appearance conversion keeps page dimensions and graphics through Word and PDF',async({page})=>{
 const dir=await makeFixtureDir(),input=await createPdf(path.join(dir,'layout.pdf'),['LAYOUT-FIRST','LAYOUT-SECOND']);
 const external=[];page.on('request',r=>{if(new URL(r.url()).origin!==new URL(test.info().project.use.baseURL).origin&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url())});
 await page.goto(base+'/pdf-to-word/');await expect(page.locator('#word-output-mode')).toHaveValue('appearance');
 await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles(input);
 const output=await runAndSaveDownload(page,dir,'document.docx'),zip=await JSZip.loadAsync(await fs.readFile(output)),xml=await zip.file('word/document.xml').async('string');
 expect((xml.match(/<w:drawing>/g)||[]).length).toBe(2);expect(xml).toContain('w:w="8400"');expect(xml).toContain('w:h="10800"');
 expect(Object.keys(zip.files).filter(n=>n.startsWith('word/media/')&&!zip.files[n].dir)).toHaveLength(2);
 await page.goto(base+'/word-to-pdf/');await expect(page.locator('#word-output-mode')).toHaveValue('appearance');await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles(output);
 const roundtrip=await runAndSaveDownload(page,dir,'word-to-pdf.pdf');const pdf=await PDFDocument.load(await fs.readFile(roundtrip));for(let n=1;n<=2;n++){const a=await render(input,n),b=await render(roundtrip,n);expect([b.width,b.height]).toEqual([a.width,a.height]);let difference=0;for(let i=0;i<a.pixels.length;i++)difference+=Math.abs(a.pixels[i]-b.pixels[i]);expect(difference/a.pixels.length).toBeLessThan(4);}
 expect(pdf.getPageCount()).toBe(2);for(const p of pdf.getPages()){expect(p.getWidth()).toBeCloseTo(420,0);expect(p.getHeight()).toBeCloseTo(540,0);expect(p.node.Resources().has(PDFName.of('XObject'))).toBe(true)}
 expect(external).toEqual([]);
});
import {createCanvas} from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import {Document,Paragraph,TextRun,Table,TableRow,TableCell,Packer,Header,Footer,ImageRun} from 'docx';
async function render(file,n=1){const task=pdfjs.getDocument({data:new Uint8Array(await fs.readFile(file)),standardFontDataUrl:'node_modules/pdfjs-dist/standard_fonts/'});try{const doc=await task.promise,p=await doc.getPage(n),v=p.getViewport({scale:1}),c=createCanvas(Math.ceil(v.width),Math.ceil(v.height));await p.render({canvasContext:c.getContext('2d'),viewport:v}).promise;return {png:c.toBuffer('image/png'),width:c.width,height:c.height,pixels:c.getContext('2d').getImageData(0,0,c.width,c.height).data};}finally{await task.destroy()}}
test('Styled DOCX keeps colored text, table shading, headers and explicit page breaks locally',async({page})=>{
 const dir=await makeFixtureDir(),file=path.join(dir,'styled.docx');
 const doc=new Document({sections:[{properties:{page:{size:{width:11906,height:16838}}},headers:{default:new Header({children:[new Paragraph({children:[new TextRun({text:'HEADER',color:'FF0000',size:32})]})]})},footers:{default:new Footer({children:[new Paragraph('FOOTER')]})},children:[new Paragraph({children:[new TextRun({text:'Styled heading',color:'FF0000',bold:true,size:48})]}),new Table({rows:[new TableRow({children:[new TableCell({shading:{fill:'0000FF'},children:[new Paragraph('Blue table cell')]}),new TableCell({children:[new Paragraph('Second column')]})]})]}),new Paragraph({pageBreakBefore:true,children:[new TextRun({text:'Second page',color:'008000',size:40})]})]}]});
 const zip=await JSZip.loadAsync(await Packer.toBuffer(doc));const rel=zip.file('word/_rels/document.xml.rels');zip.file('word/_rels/document.xml.rels',(await rel.async('string')).replace('</Relationships>','<Relationship Id="externalTest" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="https://example.invalid/private-document-marker.png" TargetMode="External"/></Relationships>'));await fs.writeFile(file,await zip.generateAsync({type:'nodebuffer'}));
 const external=[];page.on('request',r=>{if(r.url().startsWith('http')&&new URL(r.url()).origin!==new URL(test.info().project.use.baseURL).origin)external.push(r.url())});
 await page.goto(base+'/word-to-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles(file);const out=await runAndSaveDownload(page,dir,'word-to-pdf.pdf');expect((await PDFDocument.load(await fs.readFile(out))).getPageCount()).toBe(2);
 const image=await render(out);await fs.writeFile(test.info().outputPath('word-layout-page-1.png'),image.png);let red=0,blue=0;for(let i=0;i<image.pixels.length;i+=4){const [r,g,b]=image.pixels.slice(i,i+3);if(r>160&&g<100&&b<100)red++;if(b>160&&r<100&&g<100)blue++}let headerRed=0,footerInk=0;for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++){const i=(y*image.width+x)*4;if(y>image.height*.03&&y<image.height*.07&&image.pixels[i]>160&&image.pixels[i+1]<100&&image.pixels[i+2]<100)headerRed++;if(y>image.height*.90&&y<image.height*.95&&image.pixels[i]<150&&image.pixels[i+1]<150&&image.pixels[i+2]<150)footerInk++;}expect(headerRed).toBeGreaterThan(15);expect(footerInk).toBeGreaterThan(15);expect(red).toBeGreaterThan(100);expect(blue).toBeGreaterThan(1000);expect(external).toEqual([]);await expect(page.locator('iframe')).toHaveCount(0);
});

test('An actual external Word image is never fetched or silently omitted',async({page})=>{
 const dir=await makeFixtureDir(),file=path.join(dir,'external.docx'),canvas=createCanvas(4,4),doc=new Document({sections:[{children:[new Paragraph({children:[new ImageRun({type:'png',data:canvas.toBuffer('image/png'),transformation:{width:100,height:100}})]})]}]});
 const zip=await JSZip.loadAsync(await Packer.toBuffer(doc)),name='word/_rels/document.xml.rels',rels=await zip.file(name).async('string');zip.file(name,rels.replace(/(<Relationship[^>]+Type="[^"]*\/image"[^>]+Target=")[^"]+("[^>]*)(\/>)/,'$1https://example.invalid/never-fetch-document.png$2 TargetMode="External"$3'));await fs.writeFile(file,await zip.generateAsync({type:'nodebuffer'}));
 const external=[],downloads=[];page.on('request',r=>{if(r.url().includes('example.invalid'))external.push(r.url())});page.on('download',d=>downloads.push(d));await page.goto(base+'/word-to-pdf/');await expect(page.getByTestId('file-input')).toBeEnabled();await page.getByTestId('file-input').setInputFiles(file);await page.getByTestId('run-tool').click();await expect(page.locator('#status')).toContainText('No PDF was created');expect(external).toEqual([]);expect(downloads).toEqual([]);await expect(page.locator('iframe')).toHaveCount(0);
});
