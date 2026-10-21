const cards={
 images:['scan',null,'image','Turn JPG and PNG images into PDF pages.','One image per page','Images to PDF'],
 protect:['proposal',null,'lock-simple','Keep a document behind a password.','AES-256','Protect PDF'],
 unlock:['proposal',null,'lock-simple-open','Open a password-protected document.','Password needed','Unlock PDF'],
 lossless:['invoice',null,'arrows-in-simple','Reduce size while keeping selectable text.','Lossless','Lossless compression'],
 recover:['proposal','notes','arrows-clockwise','Try to recover a damaged document.','Best effort','Repair & recover'],
 jpg:['scan',null,'image','Save every page as a JPG image.','ZIP download','PDF to JPG'],
 docx:['letter',null,'file-doc','Keep page appearance or extract editable text.','Page images or text','PDF to Word'],
 xlsx:['sheet',null,'file-xls','Save page images or extract approximate rows.','Page images or text','PDF to Excel'],
 pptx:['slides',null,'file-ppt','Give every PDF page its own slide.','Image slides','PDF to PowerPoint'],
 createform:['form',null,'textbox','Add fields, checkboxes and choices.',null,'Create PDF forms'],
 drawsign:['signed',null,'signature','Draw your signature or a freehand note.','Visual signature','Draw & sign'],
 imagewatermark:['proposal',null,'image','Place your image across every page.',null,'Image watermark'],
 shapes:['notes',null,'shapes','Make your point with a shape or line.',null,'Add shapes'],
 visualcompare:['proposal','letter','columns','View two versions side by side.','Visual preview','Compare PDFs'],
 aisummary:['brief',null,'sparkle','Find the main points with on-device AI.','Browser dependent','AI summary'],
 wordtopdf:['letter',null,'file-doc','Render DOCX pages locally for sharing.','Fonts may differ','Word to PDF'],
 exceltopdf:['sheet',null,'file-xls','Render basic cell formatting and images.','Limited formatting','Excel to PDF'],
 ppttopdf:['slides',null,'file-ppt','Render supported slide text, shapes and images.','Limited layouts','PowerPoint to PDF'],
 htmltopdf:['letter',null,'code','Render local HTML with supported CSS.','Remote content blocked','HTML to PDF'],
 watermark:['proposal',null,'text-aa','Add a subtle text mark across pages.',null,'Text watermark'],
 numbers:['notes',null,'list-numbers','Keep the order clear with page numbers.',null,'Page numbers'],
 rotate:['invoice',null,'arrows-clockwise','Turn your pages the right way around.',null,'Rotate PDF'],
 crop:['proposal',null,'crop','Trim the edges for a cleaner page.',null,'Crop PDF'],
 markdown:['markdown',null,'code','Take selectable text into Markdown.','Page-based text','PDF to Markdown'],
 translate:['letter','notes','translate','Translate English text on your device.','TXT · browser dependent','Translate text'],
 fillform:['form',null,'textbox','Fill in an existing interactive form.',null,'Fill PDF forms']
};
export function createCatalogCard(id,config,select,group){
 const [file,secondary,icon,description,badge,title]=cards[id],link=document.createElement('a');link.href='#workspace';link.dataset.group=group;link.dataset.search=(config.title+' '+config.copy+' '+title).toLowerCase();link.dataset.toolCard=id;
 const cover=document.createElement('span');cover.className=`tool-cover catalog-cover catalog-${id}`;
 for(const [name,cls] of [[secondary,'secondary-page'],[file,'document-page']]){if(!name)continue;const image=document.createElement('img');image.src=`/previews/${name}.png`;image.alt='';image.className=cls;image.width=name==='slides'?900:540;image.height=name==='slides'?570:705;image.loading='lazy';image.decoding='async';cover.append(image);}
 const action=document.createElement('span');action.className='cover-action';const glyph=document.createElement('img');glyph.src=`/assets/icons/${icon}.svg`;glyph.alt='';glyph.width=glyph.height=20;action.append(glyph);cover.append(action);
 if(badge){const label=document.createElement('span');label.className='cover-badge';label.textContent=badge;cover.append(label);}
 if(['docx','xlsx','pptx','jpg','wordtopdf','exceltopdf','ppttopdf','markdown','htmltopdf'].includes(id)){const format=document.createElement('span');format.className='format-tag';format.textContent={docx:'DOCX',xlsx:'XLSX',pptx:'PPTX',jpg:'JPG',wordtopdf:'PDF',exceltopdf:'PDF',ppttopdf:'PDF',markdown:'MD',htmltopdf:'HTML'}[id];cover.append(format);}
 const heading=document.createElement('span');heading.className='tool-card-title';heading.textContent=title;const arrow=document.createElement('img');arrow.src='/assets/icons/arrow-up-right.svg';arrow.alt='';arrow.width=arrow.height=16;heading.append(arrow);const desc=document.createElement('span');desc.className='tool-card-desc';desc.textContent=description;link.append(cover,heading,desc);
 link.onclick=event=>{event.preventDefault();select(id);document.getElementById('workspace').scrollIntoView({behavior:event.detail===0||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});document.getElementById('tool-title').focus({preventScroll:true});};return link;
}
export function catalogIcon(id){return cards[id]?.[2]||'file-pdf';}
