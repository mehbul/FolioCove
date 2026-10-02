export const core = [
 ['merge','merge-pdf','Merge PDFs'],['split','split-pdf','Extract pages'],['visualorganize','organize-pdf','Organize pages'],['targetcompress','compress-pdf','Compress to size'],['camerascanner','scan-pdf','Scan photos'],['searchableocr','ocr-pdf','Searchable OCR'],['edit','edit-pdf','Add text'],['sign','sign-pdf','Typed signature'],['redact','redact-pdf','Redact region'],['privacycheck','privacy-inspector','Privacy Inspector']
];
export const notices={
 targetcompress:'Lossy conversion: pages become images, selectable text and forms are lost, and the target size is not guaranteed. Check readability before uploading.',
 compress:'Pages become images. Text selection, forms and accessibility information are lost.',
 visualorganize:'Use thumbnail buttons to move, rotate or remove pages. Keep at least one page.',
 camerascanner:'Photo capture depends on your device. Trims near-white borders; does not correct perspective or detect document corners.',
 searchableocr:'English OCR only. Invisible text is not precisely aligned with the scan. Check recognition accuracy; OCR language models may need internet to load.',
 ocr:'English OCR only. Results can contain recognition errors. Large scans can exhaust browser memory.',
 sign:'Adds a typed visual mark only. No cryptographic signature, identity verification, signature requests or audit trail.',
 edit:'Adds text overlays only; it does not edit existing PDF text. Standard fonts have limited language support.',
 redact:'Experimental raster redaction. The requested page and region are validated before output; verify the downloaded result independently before sharing sensitive material.',
 sensitive:'Experimental pattern matching, not complete personal-data detection. False positives and missed matches are possible. Review each result independently.',
 privacycheck:'Limited structural inspection, not a security audit. Sanitized sharing downloads are disabled until hidden-data removal can be independently verified.',
 sanitize:'Verified secure sanitization is currently unavailable. This tool will not create a PDF download.',
 trimheads:'Covers regions with white rectangles; underlying text remains recoverable. This is NOT redaction.',
 wordtopdf:'DOCX text extraction only; layout, images and tables are not preserved.',
 pdftoword:'Exports text as HTML in a .doc wrapper, not a native DOCX conversion. Word may show a format warning.',
 pdftoexcel:'Exports text to CSV, not native XLSX or accurate table reconstruction. Spreadsheet-triggering values are prefixed as text.',
 exceltopdf:'Exports spreadsheet cell values as text. Formatting, charts and formula layout are not preserved.',
 ppttopdf:'Exports slide text only; visual slide layout and graphics are not preserved.',
 htmltopdf:'Extracts local HTML text only; no webpage URL fetching, CSS layout or embedded images.',
 opendoc:'Text-only experimental conversion. Layout and ebook reading order may not be preserved.',
 translate:'Requires the browser Translator API and supported language models; not available in every browser. English source text only; TXT output.',
 askpdf:'Keyword passage retrieval, not AI reasoning or a generated answer. Results may be irrelevant.',
 summary:'Extractive sentence ranking, not an AI-written summary.',
 qualitycheck:'Heuristic checks for blank pages, contrast and text coverage; not an accessibility or print-compliance audit.',
 workflow:'Saves one recipe locally on this browser. Grayscale rasterizes pages and removes searchable text.',
 repair:'Resaves PDFs the parser can already read. Severely corrupted or encrypted PDFs may fail.'
};
export function classifyOutcome(className){return className.includes('error')?'failure':className.includes('ok')?'completed':null}
export function safeMetric(tool,outcome,elapsed){return {tool,outcome,durationMs:Math.max(0,Math.round(elapsed))}}
export function initLaunch(api){
 const $=id=>document.getElementById(id), status=$('status'),go=$('go');
 const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
 $('boot-state').hidden=true;
 document.querySelector('.local-badge').textContent='On-device processing';
 document.documentElement.dataset.page=location.pathname==='/'?'home':'tool';
 const previews={
  merge:['merge','proposal','invoice','Organize','Combine files in your order','files','2+ PDFs'],
  split:['split','notes',null,'Organize','Keep just the pages you need','scissors',null],
  visualorganize:['organize','proposal','notes','Organize','Move, rotate and remove pages','stack',null],
  targetcompress:['compress','invoice',null,'Organize','Find a smaller size that works','arrows-in-simple',null],
  camerascanner:['scan','scan',null,'Scan & OCR','Turn your photos into a PDF','camera',null],
  searchableocr:['ocr','scan',null,'Scan & OCR','Make scanned text searchable','text-aa','English'],
  edit:['edit','notes',null,'Edit & sign','Add a note, heading or detail','pencil-simple',null],
  sign:['sign','signed',null,'Edit & sign','Leave your typed signature','signature',null],
  redact:['redact','invoice',null,'Privacy','Cover a selected region','shield-check','Experimental'],
  privacycheck:['inspect','proposal',null,'Privacy','Take a closer look at hidden data','eye','Read only']
 };
 const icon=name=>{const img=document.createElement('img');img.src='/assets/icons/'+name+'.svg';img.alt='';img.width=20;img.height=20;return img};
 const grid=$('core-tools');for(const [id,slug,title] of core){
  const [coverName,primary,secondary,group,description,iconName,badge]=previews[id];
  const a=document.createElement('a');a.href='/'+slug+'/';a.dataset.group=group;a.dataset.search=(title+' '+description).toLowerCase();
  const cover=document.createElement('span');cover.className='tool-cover cover-'+coverName;
  for(const [name,cls] of [[secondary,'secondary-page'],[primary,'document-page']]){if(!name)continue;const img=document.createElement('img');img.src='/previews/'+name+'.png';img.alt='';img.className=cls;img.width=540;img.height=705;cover.append(img)}
  if(badge){const b=document.createElement('span');b.className='cover-badge';b.textContent=badge;cover.append(b)}
  const action=document.createElement('span');action.className='cover-action';action.append(icon(iconName));cover.append(action);
  const heading=document.createElement('span');heading.className='tool-card-title';heading.textContent=title;heading.append(icon('arrow-up-right'));
  const desc=document.createElement('span');desc.className='tool-card-desc';desc.textContent=description;
  a.append(cover,heading,desc);grid.append(a);
 }
 document.querySelectorAll('.tool span').forEach(span=>{const id=span.parentElement.dataset.tool;span.replaceChildren(icon(previews[id]?.[5]||'file-pdf'))});
 let browseCategory='all';
 const groups={organize:'Organize',edit:'Edit & sign',scan:'Scan & OCR',secure:'Privacy',convert:'Convert',intelligence:'Intelligence'};
 const applyBrowse=()=>{const q=$('discover-search').value.trim().toLowerCase();let count=0;grid.querySelectorAll('a').forEach(a=>{const show=(browseCategory==='all'||a.dataset.group===groups[browseCategory])&&a.dataset.search.includes(q);a.hidden=!show;if(show)count++});$('empty-browse').hidden=count>0};
 document.querySelectorAll('.browse-category').forEach(button=>button.addEventListener('click',()=>{browseCategory=button.dataset.category;document.querySelectorAll('.browse-category').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));applyBrowse()}));
 $('discover-search').addEventListener('input',()=>{applyBrowse();$('tool-search').value=$('discover-search').value;$('tool-search').dispatchEvent(new Event('input',{bubbles:true}))});
 const filter=$('tool-filter'),option=document.createElement('option');option.value='core';option.textContent='Everyday tools';filter.prepend(option);filter.value='all';
 const coreIds=new Set(core.map(x=>x[0]));
 const applyCore=()=>{if(filter.value!=='core')return;const q=$('tool-search').value.trim().toLowerCase();document.querySelectorAll('.tool').forEach(b=>b.style.display=(q?b.textContent.toLowerCase().includes(q):coreIds.has(b.dataset.tool))?'flex':'none')};
 filter.addEventListener('change',applyCore);$('tool-search').addEventListener('input',applyCore);applyCore();
 let running=null;
 const summary=()=>{const a=read('privypdf-beta-metrics',[]),done=a.filter(x=>x.outcome==='completed').length;$('metrics-summary').textContent=`This device: ${a.filter(x=>x.outcome==='started').length} starts · ${done} completed · ${a.filter(x=>x.outcome==='failure').length} failed. Completion is a processing signal, not proof of output quality.`};
 $('metrics-optin').checked=read('privypdf-metrics-optin',false);
 $('metrics-optin').onchange=()=>write('privypdf-metrics-optin',$('metrics-optin').checked);
 const record=(tool,outcome,ms)=>{if(!$('metrics-optin').checked)return;const a=read('privypdf-beta-metrics',[]);a.push(safeMetric(tool,outcome,ms));write('privypdf-beta-metrics',a.slice(-1000));summary()};
 $('clear-metrics').onclick=()=>{write('privypdf-beta-metrics',[]);summary()};
 $('export-metrics').onclick=()=>{const blob=new Blob([JSON.stringify(read('privypdf-beta-metrics',[]),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='foliocove-beta-metrics.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};summary();
 const showLimit=()=>{const tool=api.current();$('tool-limit').textContent=notices[tool]||'Private beta. Keep your original and inspect the output. Large, malformed or password-protected files may fail.';document.title=(api.configs[tool]?.title||'PDF tools')+' — FolioCove';document.querySelectorAll('#options input,#options select,#options textarea').forEach(el=>{if(!el.getAttribute('aria-label')&&!el.labels?.length){el.setAttribute('aria-label',el.previousElementSibling?.textContent||el.placeholder||el.id)}})};
 document.addEventListener('privypdf:tool',showLimit);
 // Old per-button option handlers still exist; run after them to label fresh controls.
 document.querySelector('.sidebar').addEventListener('click',()=>queueMicrotask(showLimit));
 const route=core.find(x=>location.pathname.replace(/\/$/,'')==='/'+x[1]);
 if(route)document.querySelector(`[data-tool="${route[0]}"]`).click();else showLimit();
 const block=(e)=>{if(running&&e.target.closest('.sidebar,#options,#files,#drop,.core-tools,#favorite')){e.preventDefault();e.stopImmediatePropagation()}};
 document.addEventListener('click',block,true);document.addEventListener('drop',block,true);
 document.addEventListener('click',e=>{if(e.target!==go||running||go.disabled)return;
  for(const input of document.querySelectorAll('#options input[type=number]'))if(!input.checkValidity()){input.reportValidity();e.stopImmediatePropagation();return}
  if(api.current()==='translate'&&!('Translator' in globalThis)){status.className='status error';status.textContent='This browser does not offer on-device translation. Choose another tool; no file was uploaded.';e.stopImmediatePropagation();return}
  if(api.files().some(f=>f.size>100*1024*1024)){status.className='status error';status.textContent='Private beta limit: 100 MB per file. Choose a smaller file.';e.stopImmediatePropagation();return}
  running={tool:api.current(),start:performance.now()};record(running.tool,'started',0);$('job-controls').hidden=false;document.querySelector('.sidebar').inert=true;$('options').inert=true;$('files').inert=true;
 },true);
 const finish=outcome=>{if(!running)return;record(running.tool,outcome,performance.now()-running.start);running=null;$('job-controls').hidden=true;document.querySelector('.sidebar').inert=false;$('options').inert=false;$('files').inert=false;};
 new MutationObserver(()=>{if(!running)return;const text=status.textContent,m=text.match(/page (\d+) of (\d+)/i);$('job-stage').textContent=m?`Page ${m[1]} of ${m[2]}`:'Processing on this device…';if(m){$('job-progress').max=+m[2];$('job-progress').value=+m[1]}else $('job-progress').removeAttribute('value');const result=classifyOutcome(status.className);if(result){if(result==='failure')status.textContent+='\nKeep the original. Try a smaller, unencrypted file; report only the tool and error category, not document contents.';finish(result)}}).observe(status,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 new MutationObserver(()=>{if(running&&!go.disabled)finish('completed')}).observe(go,{attributes:true,attributeFilter:['disabled']});
 $('cancel-job').onclick=()=>{if(confirm('Stop by reloading this tab? Selected files and unsaved settings will be cleared.')){finish('cancelled');location.reload()}};
 window.addEventListener('beforeunload',e=>{if(running){e.preventDefault();e.returnValue=''}});
 if(!window.isSecureContext){$('boot-state').hidden=false;$('boot-state').textContent='Some tools require HTTPS and may not work in this context.'}
}



