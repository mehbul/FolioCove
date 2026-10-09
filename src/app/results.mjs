export function readableBytes(bytes){
 if(bytes<1024)return `${bytes} B`;
 return `${(bytes/(bytes<1024*1024?1024:1024*1024)).toLocaleString(undefined,{maximumFractionDigits:1})} ${bytes<1024*1024?'KB':'MB'}`;
}

export function initResults(){
 const status=document.getElementById('status');
 const panel=document.createElement('section');panel.className='download-result';panel.hidden=true;panel.setAttribute('aria-label','Prepared download');
 status.after(panel);
 let url=null;
 const clear=()=>{if(url)URL.revokeObjectURL(url);url=null;panel.hidden=true;panel.replaceChildren();};
 document.addEventListener('privypdf:tool',clear);
 document.addEventListener('privypdf:files',clear);
 document.addEventListener('privypdf:download',({detail})=>{
  clear();
  const {blob,name,tool,inputBytes}=detail;
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
  panel.append(note,again);panel.hidden=false;
 });
 window.addEventListener('pagehide',clear);
}
