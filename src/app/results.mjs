export function readableBytes(bytes){
 if(bytes<1024)return `${bytes} B`;
 return `${(bytes/(bytes<1024*1024?1024:1024*1024)).toLocaleString(undefined,{maximumFractionDigits:1})} ${bytes<1024*1024?'KB':'MB'}`;
}

export function initResults(api){
 const status=document.getElementById('status');
 const inputFiles=document.getElementById('files');
 const panel=document.createElement('section');panel.className='download-result';panel.hidden=true;panel.setAttribute('aria-label','Prepared download');
 status.after(panel);
 let url=null,prepared=null;
 const clear=()=>{if(url)URL.revokeObjectURL(url);url=null;prepared=null;panel.hidden=true;panel.replaceChildren();};
 const syncBusy=()=>{const next=panel.querySelector('fieldset');if(next)next.disabled=inputFiles.inert;};
 new MutationObserver(syncBusy).observe(inputFiles,{attributes:true,attributeFilter:['inert']});
 document.addEventListener('privypdf:tool',clear);
 document.addEventListener('privypdf:files',clear);
 // A prepared file belongs to the settings that produced it.
 const settingsChanged=()=>{
  if(panel.hidden)return;
  clear();
  if(status.classList.contains('ok')){status.textContent='';status.className='status';}
 };
 const options=document.getElementById('options');
 options.addEventListener('input',settingsChanged);
 options.addEventListener('change',settingsChanged);
 document.addEventListener('privypdf:download',({detail})=>{
  clear();
  const {blob,name,tool,inputBytes}=detail;
  prepared=detail;
  const heading=document.createElement('h3');heading.textContent='Your download is prepared';
  const details=document.createElement('p');details.className='download-details';details.textContent=`${name} · ${readableBytes(blob.size)}`;
  const note=document.createElement('p');note.textContent='Open the downloaded file and check the result. Keep your original.';
  panel.append(heading,details);
  if(['compress','targetcompress','lossless'].includes(tool)&&inputBytes>0){
   const comparison=document.createElement('p');
   const delta=(inputBytes-blob.size)/inputBytes*100;
   comparison.textContent=`Original ${readableBytes(inputBytes)} → output ${readableBytes(blob.size)}. ${delta>0?`${delta.toFixed(1)}% smaller.`:delta<0?`${Math.abs(delta).toFixed(1)}% larger; this output did not reduce file size.`:'File size is unchanged.'}`;
   panel.append(comparison);
  }
  const again=document.createElement('a');again.className='download-again';url=URL.createObjectURL(blob);again.href=url;again.download=name;again.textContent='Download again';
  panel.append(note,again);
  // Only offer known single-PDF workflows. Encrypted output needs unlocking first.
  if(blob.type.split(';')[0].toLowerCase()==='application/pdf'&&/\.pdf$/i.test(name)&&tool!=='protect'&&blob.size<=100*1024*1024){
   const destinations=['visualorganize','split','lossless'].filter(id=>id!==tool&&api.configs[id]?.accept.split(',').includes('application/pdf'));
   if(destinations.length){
    const group=document.createElement('fieldset');group.className='result-next';
    const legend=document.createElement('legend');legend.textContent='Use this result in another tool';
    const label=document.createElement('label');label.htmlFor='result-next-tool';label.textContent='Next PDF tool';
    const controls=document.createElement('div');controls.className='result-next-controls';
    const next=document.createElement('select');next.id='result-next-tool';
    for(const id of destinations){const option=document.createElement('option');option.value=id;option.textContent=api.configs[id].title;next.append(option);}
    const use=document.createElement('button');use.type='button';use.className='download-again';use.textContent='Use this PDF';
    const explanation=document.createElement('p');explanation.id='result-next-note';explanation.textContent='Uses the prepared PDF on this device, with fresh settings. Review the next tool’s limits before processing.';
    next.setAttribute('aria-describedby',explanation.id);use.setAttribute('aria-describedby',explanation.id);
    use.addEventListener('click',()=>{
     if(prepared!==detail||inputFiles.inert||!destinations.includes(next.value))return;
     const target=next.value,file=new File([blob],name,{type:'application/pdf'});
     api.select(target);api.addFiles([file]);
     status.className='status';status.textContent=`${name} is ready in ${api.configs[target].title}. Review the tool limits, then process.`;
     document.getElementById('tool-title').focus();
    });
    controls.append(next,use);group.append(legend,label,controls,explanation);panel.append(group);
   }
  }
  panel.hidden=false;syncBusy();
 });
 window.addEventListener('pagehide',clear);
}
