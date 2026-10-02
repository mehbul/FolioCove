// Browser AI APIs can remain pending when a local model is unavailable.
export function localModelStep(promise, milliseconds=20000) {
 let timer,expired=false;
 const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(Error('The on-device AI model is not ready. Retry after its browser-managed download completes, or use another local tool.'));},milliseconds);});
 const operation=Promise.resolve(promise).then(value=>{if(expired)value?.destroy?.();return value;});
 return Promise.race([operation,timeout]).finally(()=>clearTimeout(timer));
}
