export function refineOptions(){
 const options=document.getElementById('options');if(!options?.children.length||options.classList.contains('refined'))return;
 for(const label of [...options.children].filter(el=>el.tagName==='LABEL')){
  if(label.querySelector('input')){label.classList.add('option-check');continue;}
  const input=label.nextElementSibling;if(!input||!['INPUT','SELECT','TEXTAREA'].includes(input.tagName))continue;
  const field=document.createElement('div');field.className='option-field';if(input.tagName==='TEXTAREA'||input.type==='file')field.classList.add('option-wide');
  if(input.id)label.htmlFor=input.id;label.before(field);field.append(label,input);
 }
 for(const child of options.children)if(child.matches('.hint,canvas,button'))child.classList.add('option-wide');
 options.classList.add('refined');
}
export function initDesignUI(){
 document.addEventListener('privypdf:tool',()=>queueMicrotask(refineOptions));
 document.querySelector('.sidebar').addEventListener('click',()=>queueMicrotask(refineOptions));
 queueMicrotask(refineOptions);
}
