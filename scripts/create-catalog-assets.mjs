import fs from 'node:fs/promises';
import path from 'node:path';
import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {createCanvas} from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
// Synthetic, readable document examples rendered through the real PDF engine.
const out=path.resolve('src/static/previews');
for(const name of ['letter','sheet','slides','form','brief','markdown']){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold),mono=await doc.embedFont(StandardFonts.Courier);
 const p=doc.addPage(name==='slides'?[600,380]:[360,470]),ink=rgb(.14,.14,.14),muted=rgb(.43,.43,.43),coral=rgb(.77,.16,.28),line=rgb(.85,.85,.85);
 const text=(s,x,y,size=10,f=font,color=ink)=>p.drawText(s,{x,y,size,font:f,color});
 text('FolioCove',30,p.getHeight()-40,11,bold,coral);
 if(name==='slides'){
  text('Project overview',36,255,32,bold);text('A plan for the next chapter.',36,218,15,font,muted);
  p.drawRectangle({x:36,y:62,width:235,height:104,color:rgb(.97,.91,.93)});text('A clear direction',53,135,15,bold);text('One idea. A useful next step.',53,104,11);
  text('The approach',318,139,15,bold);text('Review the work',318,108,11);text('Gather feedback',318,84,11);
 }else if(name==='sheet'){
  text('Project expenses',30,373,24,bold);text('Illustrative values / October 2026',30,348,8,font,muted);
  const rows=[['Item','Quantity','Amount'],['Consultation','2','240.00'],['Documents','4','80.00'],['Review','1','120.00'],['Total','','440.00']];
  rows.forEach((row,i)=>{const y=302-i*37;p.drawRectangle({x:30,y:y-12,width:300,height:37,color:i===0?rgb(.95,.89,.91):i%2?rgb(.97,.97,.97):rgb(1,1,1)});row.forEach((value,j)=>text(value,[40,184,254][j],y,9,i===0||i===4?bold:font));p.drawLine({start:{x:30,y:y-12},end:{x:330,y:y-12},color:line,thickness:.5});});
 }else if(name==='form'){
  text('Let us know.',30,372,24,bold);text('A simple project intake form',30,348,9,font,muted);
  const form=doc.getForm();for(const [label,y] of [['Full name',289],['Email address',216]]){text(label,30,y,10,bold);form.createTextField(label).addToPage(p,{x:30,y:y-43,width:300,height:30,borderColor:line});}
  text('Project type',30,146,10,bold);form.createCheckBox('Document').addToPage(p,{x:30,y:111,width:13,height:13,borderColor:line});text('Document preparation',52,113,9);form.flatten();
 }else if(name==='markdown'){
  text('document.md',30,372,22,bold);const rows=['# Project notes','','## The idea','A clearer way to share the work.','','## Next steps','- Review the first draft','- Gather the team feedback','- Prepare the final document'];rows.forEach((s,i)=>text(s,30,316-i*22,9,mono,s.startsWith('#')?coral:ink));
 }else if(name==='brief'){
  text('The main points.',30,372,23,bold);text('A concise example brief',30,348,9,font,muted);
  for(const [i,title,body] of [[0,'A clear plan','Bring the project into focus.'],[1,'A useful next step','Review the first draft together.'],[2,'Room for feedback','Keep a copy of the original.']]){const y=289-i*63;p.drawRectangle({x:30,y:y+1,width:4,height:4,color:coral});text(title,44,y,11,bold);text(body,44,y-22,9,font,muted);}
 }else{
  text('A note to the team.',30,372,23,bold);text('Project update / Example document',30,348,8,font,muted);
  ['Hello everyone,','Here is a short update on our project.','The first draft is ready for your review.','','Please share your feedback this week.','We can then prepare the final version.','','Thank you,','Alex Morgan'].forEach((s,i)=>text(s,30,294-i*21,9,i===8?bold:font));
 }
 text('SYNTHETIC EXAMPLE',30,26,6,font,muted);
 const task=pdfjs.getDocument({data:await doc.save(),standardFontDataUrl:path.resolve('node_modules/pdfjs-dist/standard_fonts')+'/'}),pdf=await task.promise,page=await pdf.getPage(1),viewport=page.getViewport({scale:1.5}),canvas=createCanvas(viewport.width,viewport.height);
 await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;await fs.writeFile(path.join(out,name+'.png'),canvas.toBuffer('image/png'));await task.destroy();
}
console.log('Rendered six synthetic catalog document previews.');
