import {createPdfToolkit} from 'pdfstudio';
self.onmessage=async ({data:{id,data,password}})=>{
 try {const pdf=await createPdfToolkit({wasmUrl:'/assets/qpdf.wasm'});const bytes=await (id==='protect'?pdf.lock(data,{userPassword:password,keyLength:256}):id==='unlock'?pdf.unlock(data,{password:password||''}):id==='lossless'?pdf.compress(data):pdf.repair(data));self.postMessage({bytes});}
 catch(error){self.postMessage({error:error.name==='PdfPasswordError'?'The document password is incorrect.':error.message||'This PDF could not be processed.'});}
};
