import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';

const defaults = () => ({filter:'original',brightness:1,contrast:1,saturation:1,sharpness:0,threshold:160,rotation:0,flipX:false,flipY:false,invert:false,auto:false,left:0,top:0,right:100,bottom:100});
const papers = {a4:[595.28,841.89],a5:[419.53,595.28],letter:[612,792],legal:[612,1008]};
const numberField = (id,label,value,min,max,step=1) => `<label for="ip-${id}">${label}</label><input id="ip-${id}" type="number" value="${value}" min="${min}" max="${max}" step="${step}">`;
const selectField = (id,label,choices) => `<label for="ip-${id}">${label}</label><select id="ip-${id}">${choices.map(([value,text])=>`<option value="${value}">${text}</option>`).join('')}</select>`;
const checkField = (id,label) => `<label><input id="ip-${id}" type="checkbox"> ${label}</label>`;

export function imageLayout(width,height,options) {
  let [w,h] = options.paper==='image' ? [width*72/options.dpi,height*72/options.dpi] : [...papers[options.paper]];
  if(options.orientation==='landscape'||options.orientation==='auto'&&width>height)[w,h]=[Math.max(w,h),Math.min(w,h)];
  else if(options.orientation==='portrait')[w,h]=[Math.min(w,h),Math.max(w,h)];
  const margin=options.margin*72/25.4,footer=options.numbers?18:0,aw=w-margin*2,ah=h-margin*2-footer;
  if(aw<=0||ah<=0)throw Error('Margins leave no room for the image. Reduce margins or choose larger paper.');
  const scale=options.fit==='cover'?Math.max(aw/width,ah/height):Math.min(aw/width,ah/height);
  const iw=options.fit==='stretch'?aw:width*scale,ih=options.fit==='stretch'?ah:height*scale;
  return {width:w,height:h,x:margin+(aw-iw)/2,y:margin+footer+(ah-ih)/2,iw,ih,margin,footer,aw,ah};
}

async function processImage(file,s,maxEdge=3508) {
  for(const [key,min,max] of [['brightness',0,2],['contrast',0,3],['saturation',0,3],['sharpness',0,1],['threshold',0,255],['left',0,99],['top',0,99],['right',1,100],['bottom',1,100]]){
    if(!Number.isFinite(s[key])||s[key]<min||s[key]>max)throw Error(`Choose ${key} between ${min} and ${max}.`);
  }
  let bitmap;
  try {bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});} catch {throw Error(`${file.name}: unreadable image. Choose JPG, PNG, WebP or BMP; convert HEIC/TIFF first.`);}
  try {
    if(bitmap.width*bitmap.height>24000000)throw Error(`${file.name}: maximum image size is 24 megapixels.`);
    if(s.right<=s.left||s.bottom<=s.top)throw Error('Crop right/bottom must be greater than left/top.');
    const sw=bitmap.width*(s.right-s.left)/100,sh=bitmap.height*(s.bottom-s.top)/100;
    const scale=Math.min(1,maxEdge/Math.max(sw,sh));
    const w=Math.max(1,Math.round(sw*scale)),h=Math.max(1,Math.round(sh*scale));
    const canvas=document.createElement('canvas');
    const rotated=s.rotation%180!==0;canvas.width=rotated?h:w;canvas.height=rotated?w:h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(s.rotation*Math.PI/180);ctx.scale(s.flipX?-1:1,s.flipY?-1:1);
    ctx.drawImage(bitmap,bitmap.width*s.left/100,bitmap.height*s.top/100,sw,sh,-w/2,-h/2,w,h);ctx.restore();
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
    let low=255,high=0;
    if(s.auto)for(let i=0;i<d.length;i+=4){const y=.299*d[i]+.587*d[i+1]+.114*d[i+2];low=Math.min(low,y);high=Math.max(high,y);}
    for(let i=0;i<d.length;i+=4){
      let r=d[i],g=d[i+1],b=d[i+2];
      if(s.auto&&high>low){r=(r-low)*255/(high-low);g=(g-low)*255/(high-low);b=(b-low)*255/(high-low);}
      r=(r*s.brightness-128)*s.contrast+128;g=(g*s.brightness-128)*s.contrast+128;b=(b*s.brightness-128)*s.contrast+128;
      const y=.299*r+.587*g+.114*b;
      r=y+(r-y)*s.saturation;g=y+(g-y)*s.saturation;b=y+(b-y)*s.saturation;
      if(s.filter==='grayscale')r=g=b=y;
      if(s.filter==='bw'||s.filter==='scan')r=g=b=y>=s.threshold?255:0;
      if(s.filter==='sepia'){const rr=r*.393+g*.769+b*.189,gg=r*.349+g*.686+b*.168,bb=r*.272+g*.534+b*.131;r=rr;g=gg;b=bb;}
      d[i]=s.invert?255-r:r;d[i+1]=s.invert?255-g:g;d[i+2]=s.invert?255-b:b;
    }
    if(s.sharpness>0){const source=new Uint8ClampedArray(d),cw=canvas.width,ch=canvas.height,k=s.sharpness;for(let y=1;y<ch-1;y++)for(let x=1;x<cw-1;x++)for(let c=0;c<3;c++){const i=(y*cw+x)*4+c;d[i]=source[i]*(1+4*k)-k*(source[i-4]+source[i+4]+source[i-cw*4]+source[i+cw*4]);}}
    ctx.putImageData(pixels,0,0);
    return {canvas,width:rotated?sh:sw,height:rotated?sw:sh};
  } finally {bitmap.close();}
}

// Preview and export deliberately use the same image and page compositor.
async function compose(file,settings,options,index,total,preview=false) {
  const image=await processImage(file,settings,preview?1100:3508);
  const layout=imageLayout(image.width,image.height,options);
  const factor=Math.min(options.dpi/72,(preview?1000:3508)/Math.max(layout.width,layout.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(layout.width*factor));canvas.height=Math.max(1,Math.round(layout.height*factor));
  const ctx=canvas.getContext('2d');ctx.scale(factor,factor);ctx.fillStyle=options.background;ctx.fillRect(0,0,layout.width,layout.height);
  ctx.save();ctx.beginPath();ctx.rect(layout.margin,layout.margin,layout.aw,layout.ah);ctx.clip();
  ctx.drawImage(image.canvas,layout.x,layout.height-layout.y-layout.ih,layout.iw,layout.ih);ctx.restore();image.canvas.width=image.canvas.height=0;
  if(preview&&options.numbers){ctx.fillStyle='#333';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(`${index+1} / ${total}`,layout.width/2,layout.height-9);}
  return {canvas,layout};
}

export function createImagePdfWorkspace(panel,{getFiles,setFiles,onChange,onError}) {
  let settings=new WeakMap(),active=null,run=0,timer,root=null;
  const state=file=>{if(!settings.has(file))settings.set(file,defaults());return settings.get(file);};
  const $=id=>root.querySelector(`#ip-${id}`);
  function readOptions(){
    const o={paper:$('paper').value,orientation:$('orientation').value,fit:$('fit').value,margin:+$('margin').value,dpi:+$('dpi').value,quality:+$('quality').value/100,background:$('background').value,numbers:$('numbers').checked,title:$('title').value,filename:$('filename').value};
    if(!Number.isFinite(o.margin)||o.margin<0||o.margin>50)throw Error('Choose margins from 0 to 50 mm.');
    if(!Number.isFinite(o.quality)||o.quality<.4||o.quality>1)throw Error('Choose JPEG quality from 40 to 100.');
    return o;
  }
  async function preview(){
    const token=++run,file=active;if(!file){$('preview').removeAttribute('src');return;}
    $('note').textContent='Updating preview…';
    try {const {canvas}=await compose(file,{...state(file)},readOptions(),getFiles().indexOf(file),getFiles().length,true);
      if(token===run&&root?.isConnected){$('preview').src=canvas.toDataURL('image/jpeg',.85);$('note').textContent='Preview: same filters and layout as export, at reduced resolution.';}
      canvas.width=canvas.height=0;
    }catch(e){if(token===run)$('note').textContent=e.message;}
  }
  function schedulePreview(){clearTimeout(timer);timer=setTimeout(preview,100);}
  function changed(){onChange();schedulePreview();}
  function loadSettings(){if(!active)return;const s=state(active);for(const [key,value]of Object.entries(s)){const el=$(key);if(el.type==='checkbox')el.checked=value;else el.value=value;}schedulePreview();}
  function sync(){
    if(!root)return;
    const files=getFiles();if(!files.includes(active))active=files[0]||null;
    const select=$('page');select.replaceChildren();files.forEach((file,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`${i+1}. ${file.name}`;select.append(option);});select.value=files.indexOf(active);
    $('image-fields').disabled=!active;$('page').disabled=!active;
    $('thumbnails').replaceChildren();
    files.forEach((file,i)=>{
      const button=document.createElement('button');button.type='button';button.textContent=`${i+1}. ${file.name}`;button.className='image-page-chip';button.setAttribute('aria-pressed',String(file===active));button.draggable=true;
      button.onclick=()=>{active=file;sync();};button.ondragstart=e=>{e.dataTransfer.setData('text/plain',String(i));};button.ondragover=e=>e.preventDefault();button.ondrop=e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain'));if(!Number.isInteger(from)||from<0||from>=files.length)return;const next=[...getFiles()];const [moved]=next.splice(from,1);next.splice(i,0,moved);setFiles(next);};$('thumbnails').append(button);
    });
    loadSettings();if(!active){++run;$('preview').removeAttribute('src');$('note').textContent='Add pictures to preview your PDF.';}
  }
  function mount(){
    panel.className='visual-panel show';panel.innerHTML=`<section class="image-pdf-workspace" aria-label="Image PDF editor">
      <h3>Pictures to pages</h3><p>Selection order becomes page order. Use the file arrows or drag the page buttons. Up to 100 images, 20 MB and 24 megapixels each. JPG, PNG, WebP and BMP; convert HEIC/TIFF first. Files stay in this tab until you leave or reload.</p>
      <div class="image-order-actions"><button type="button" id="ip-sort">Sort by filename</button><button type="button" id="ip-reverse">Reverse order</button></div>
      <div id="ip-thumbnails" class="image-page-list" aria-label="Image page selection"></div>
      <div class="image-pdf-grid"><div><img id="ip-preview" alt="Selected PDF page preview"><p id="ip-note" role="status">Add pictures to preview your PDF.</p></div><div>
      <label for="ip-page">Adjust image</label><select id="ip-page"></select>
      <fieldset id="ip-image-fields"><legend>Image adjustments</legend>
      ${selectField('filter','Filter',[['original','Original color'],['grayscale','Grayscale'],['bw','Black & white'],['scan','Document scan'],['sepia','Sepia']])}
      ${numberField('brightness','Brightness',1,0,2,.1)}${numberField('contrast','Contrast',1,0,3,.1)}${numberField('saturation','Saturation',1,0,3,.1)}${numberField('sharpness','Sharpen',0,0,1,.1)}${numberField('threshold','Black & white threshold',160,0,255)}
      ${selectField('rotation','Rotate clockwise',[[0,'0°'],[90,'90°'],[180,'180°'],[270,'270°']])}
      ${checkField('flipX','Flip horizontal')}${checkField('flipY','Flip vertical')}${checkField('auto','Auto contrast')}${checkField('invert','Invert colors')}
      <details><summary>Crop image</summary><p>Percentage bounds before rotation. Keep the region between left/right and top/bottom.</p>${numberField('left','Crop left (%)',0,0,99)}${numberField('top','Crop top (%)',0,0,99)}${numberField('right','Crop right (%)',100,1,100)}${numberField('bottom','Crop bottom (%)',100,1,100)}</details>
      <div class="image-order-actions"><button type="button" id="ip-reset">Reset image</button><button type="button" id="ip-apply">Apply to all images</button><button type="button" id="ip-duplicate">Duplicate image</button></div></fieldset>
      </div></div><fieldset><legend>PDF settings</legend><div class="image-pdf-options">
      ${selectField('paper','Paper size',[['image','Match each image'],['a4','A4'],['a5','A5'],['letter','Letter'],['legal','Legal']])}
      ${selectField('orientation','Orientation',[['auto','Auto'],['portrait','Portrait'],['landscape','Landscape']])}
      ${selectField('fit','Image fit',[['contain','Fit whole image'],['cover','Fill page — crop edges'],['stretch','Stretch to fit']])}
      ${numberField('margin','Margin (mm)',0,0,50)}${selectField('dpi','Resolution',[[150,'150 DPI'],[72,'72 DPI'],[200,'200 DPI'],[300,'300 DPI']])}${numberField('quality','JPEG quality',90,40,100)}
      <label for="ip-background">Page background</label><input id="ip-background" type="color" value="#ffffff">
      <label for="ip-title">Document title</label><input id="ip-title" maxlength="200" value="Image document">
      <label for="ip-filename">Download filename</label><input id="ip-filename" maxlength="100" value="images">
      ${checkField('numbers','Add page numbers')}</div></fieldset>
      <p>One picture per page. Transparent pixels become white. Images are re-encoded without source metadata and capped at 3508 pixels on the longest edge. No OCR, perspective correction, or automatic searchable text.</p></section>`;
    root=panel.firstElementChild;
    $('page').onchange=()=>{active=getFiles()[+$('page').value];sync();};
    $('sort').onclick=()=>setFiles([...getFiles()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})));
    $('reverse').onclick=()=>setFiles([...getFiles()].reverse());
    $('reset').onclick=()=>{settings.set(active,defaults());loadSettings();changed();};
    $('apply').onclick=()=>{for(const file of getFiles())settings.set(file,{...state(active)});changed();};
    $('duplicate').onclick=()=>{if(getFiles().length>=100)return onError(Error('Maximum 100 images per PDF.'));const copy=new File([active],active.name,{type:active.type});settings.set(copy,{...state(active)});const next=[...getFiles()];next.splice(next.indexOf(active)+1,0,copy);setFiles(next);};
    root.addEventListener('input',e=>{
      const key=e.target.id.replace('ip-','');
      if(key==='page')return;
      if(active&&key in defaults())state(active)[key]=e.target.type==='checkbox'?e.target.checked:['filter'].includes(key)?e.target.value:Number(e.target.value);
      changed();
    });sync();
  }
  return {mount,sync,unmount(){clearTimeout(timer);++run;root=null;active=null;settings=new WeakMap();},
    async export(){
      const files=[...getFiles()],options=readOptions();
      if(!files.length||files.length>100)throw Error('Choose between 1 and 100 images.');
      const pdf=await PDFDocument.create();pdf.setTitle(options.title);
      const font=options.numbers?await pdf.embedFont(StandardFonts.Helvetica):null;
      for(let i=0;i<files.length;i++){
        if(files[i].size>20*1024*1024)throw Error(`${files[i].name}: maximum file size is 20 MB.`);
        const {canvas,layout}=await compose(files[i],{...state(files[i])},options,i,files.length);
        const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',options.quality));canvas.width=canvas.height=0;
        if(!blob)throw Error('This browser could not encode a page. Try a lower resolution.');
        const image=await pdf.embedJpg(await blob.arrayBuffer()),page=pdf.addPage([layout.width,layout.height]);
        page.drawImage(image,{x:0,y:0,width:layout.width,height:layout.height});
        if(font){const label=`${i+1} / ${files.length}`;page.drawText(label,{x:(layout.width-font.widthOfTextAtSize(label,10))/2,y:9,size:10,font,color:rgb(.2,.2,.2)});}
      }
      return {pdf,filename:(options.filename.replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').replace(/\.pdf$/i,'').trim()||'images')+'.pdf'};
    }
  };
}
