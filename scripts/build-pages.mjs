// Preserve the Sites build; adapt its generated static assets for a Pages project URL.
import './build.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {site} from '../src/content/site.mjs';
const base='/FolioCove';
const origin='https://mehbul.github.io'+base;
async function adapt(directory){
 for(const entry of await fs.readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory()){await adapt(file);continue;}
  if(!/\.(html|css|js|mjs|json|txt|md|webmanifest)$/.test(file))continue;
  let text=await fs.readFile(file,'utf8');
  text=text.replaceAll(site.origin,origin);
  // Only application asset/route literals; relative bundled imports stay unchanged.
  text=text.replace(/(["'`])\/(assets\/|previews\/|launch\.mjs|sw\.js|[^"'`\s<>]*\.css|manifest\.webmanifest|tester-results\.csv|device-pilot\.csv|capabilities\.json|llms\.txt|(?:merge-pdf|split-pdf|organize-pdf|compress-pdf|scan-pdf|ocr-pdf|edit-pdf|sign-pdf|redact-pdf|privacy-inspector|testing|privacy|security|limitations|terms|tools)\/|\?tool=)/g,`$1${base}/$2`);
  if(file.endsWith('.html'))text=text.replaceAll('href="/"',`href="${base}/"`);
  if(file.endsWith('launch.mjs'))text=text.replaceAll("location.pathname==='/'",`location.pathname==='${base}/'`).replaceAll("a.href='/'+slug",`a.href='${base}/'+slug`).replaceAll("==='/'+x[1]",`==='${base}/'+x[1]`);
  text=text.replaceAll('private-beta','public-beta').replaceAll('Private beta','Public beta').replaceAll('private beta','public beta').replaceAll('Owner-private beta','Public beta').replaceAll('owner-private beta','public beta');
  text=text.replaceAll('authenticates private access','serves public assets').replaceAll('authenticates access','serves public assets').replaceAll('controls private access','serves public assets').replaceAll('controls access','serves public assets');
  if(file.endsWith('.html'))text=text.replace('</footer>','<p style="text-align:center;padding:16px"><a href="https://github.com/mehbul/FolioCove/issues">Report a bug on GitHub</a> · Use synthetic examples; do not attach personal documents.</p></footer>');
  // Disclosure of incomplete launch requirements remains; do not claim full validation.
  await fs.writeFile(file,text);
 }
}
await adapt('dist');
await fs.writeFile('dist/.nojekyll','');
console.log('Prepared GitHub Pages beta at '+origin+'/ (search indexing remains disabled).');
