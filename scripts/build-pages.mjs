// Preserve the Sites build; adapt its generated static assets for a Pages project URL.
import './build.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {site} from '../src/content/site.mjs';
import {core,pages} from '../src/content/routes.mjs';
import {buildDiscovery} from '../src/content/discovery.mjs';
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
  if(file.endsWith('.html'))text=text.replaceAll('href="/"',`href="${base}/"`).replaceAll('content="noindex,nofollow"','content="index,follow"').replaceAll('<base href="/">',`<base href="${base}/">`).replaceAll('FolioCove — Private PDF tools','FolioCove — Free, open-source PDF tools');
  text=text.replaceAll('not yet publicly indexed','eligible for public search indexing');
  if(file===path.join('dist','index.html'))text=text.replace('</head>','<meta name="google-site-verification" content="DvS9BP2Rzh2vGhwIWFxLYanLAzH4cOliBGzBFmZpxzY"></head>');
  if(file.endsWith('launch.mjs'))text=text.replaceAll("location.pathname==='/'",`location.pathname==='${base}/'`).replaceAll("a.href='/'+slug",`a.href='${base}/'+slug`).replaceAll("==='/'+x[1]",`==='${base}/'+x[1]`);
  text=text.replaceAll('private-beta','public-beta').replaceAll('PRIVATE BETA','PUBLIC BETA').replaceAll('Private beta','Public beta').replaceAll('private beta','public beta').replaceAll('Owner-private beta','Public beta').replaceAll('owner-private beta','public beta');
  text=text.replaceAll('authenticates private access','serves public assets').replaceAll('authenticates access','serves public assets').replaceAll('controls private access','serves public assets').replaceAll('controls access','serves public assets');
  if(file.endsWith('.html'))text=text.replace('</footer>','<p style="text-align:center;padding:16px"><a href="https://github.com/mehbul/FolioCove/issues">Report a bug on GitHub</a> · Use synthetic examples; do not attach personal documents.</p></footer>');
  // Disclosure of incomplete launch requirements remains; do not claim full validation.
  await fs.writeFile(file,text);
 }
}
await adapt('dist');
await fs.writeFile('dist/.nojekyll','');
await fs.mkdir('dist/demo',{recursive:true});
await fs.copyFile('src/static/demo/merge.webm','dist/demo/merge.webm');
await fs.writeFile('dist/demo/index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FolioCove demo — Merge PDFs on your device</title><meta name="description" content="Watch a short real workflow merging two synthetic PDFs locally in FolioCove."><meta name="robots" content="index,follow"><link rel="canonical" href="${origin}/demo/"><link rel="stylesheet" href="${base}/launch.css"></head><body><main style="max-width:1100px;margin:40px auto;padding:24px"><a href="${base}/">← Open FolioCove</a><h1>Two PDFs. One document.</h1><p>A short recording of a real browser workflow using synthetic sample files. No document uploads.</p><video controls preload="metadata" style="width:100%;border-radius:16px" aria-label="FolioCove PDF merge demonstration"><source src="merge.webm" type="video/webm"><track kind="captions" src="captions.vtt" srclang="en" label="English" default></video><h2>Demo transcript</h2><ol><li>Browse FolioCove and open Merge PDFs.</li><li>Select two synthetic PDFs from the device.</li><li>Choose Merge &amp; download.</li><li>The browser downloads the combined PDF. This demo’s output was checked to contain two pages.</li></ol><p>Public beta: inspect your outputs. Redaction is experimental; browser AI is conditional; verified sanitization and PDF/A are unavailable.</p></main></body></html>`);
await fs.writeFile('dist/demo/captions.vtt','WEBVTT\n\n00:00.000 --> 00:06.000\nBrowse free PDF tools in FolioCove.\n\n00:06.000 --> 00:11.000\nOpen Merge PDFs. Documents stay on your device.\n\n00:11.000 --> 00:19.000\nChoose two synthetic sample PDFs.\n\n00:19.000 --> 00:32.000\nMerge and download the combined PDF. Inspect the result.\n');
const guideUrls=await buildDiscovery();
const urls=['',...core.map(x=>x[1]),...Object.keys(pages),'tools','demo',...guideUrls];
await fs.writeFile('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(slug=>`<url><loc>${origin}/${slug?slug+'/':''}</loc></url>`).join('\n')+'\n</urlset>\n');
// robots.txt belongs at the host root; this project copy is informational.
await fs.writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log('Prepared indexable GitHub Pages beta at '+origin+'/ with sitemap.');
