import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build as esbuild} from 'esbuild';
import {core, pages} from '../src/content/routes.mjs';
import {baseTools} from '../src/content/tools.mjs';
import {site} from '../src/content/site.mjs';
import {capabilityData,toolDirectory,pageMetadata,knowledgeMarkdown,escapeHtml} from '../src/content/ai.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

async function copyFile(from, to) {
  await fs.mkdir(path.dirname(to), {recursive: true});
  await fs.copyFile(from, to);
}

async function copyPdfJsWasmAssets() {
  const fromDir = path.join(root, 'node_modules', 'pdfjs-dist', 'wasm');
  const toDir = path.join(dist, 'assets', 'pdfjs', 'wasm');
  const files = [
    'jbig2.wasm',
    'jbig2_nowasm_fallback.js',
    'openjpeg.wasm',
    'openjpeg_nowasm_fallback.js',
    'qcms_bg.wasm',
    'quickjs-eval.js',
    'quickjs-eval.wasm'
  ];
  for (const file of files) await copyFile(path.join(fromDir, file), path.join(toDir, file));
}

async function writeFile(to, content) {
  await fs.mkdir(path.dirname(to), {recursive: true});
  await fs.writeFile(to, content);
}

function cleanGeneratedText(content) {
  return content.replace(/[ \t]+$/gm, '').replace(/\r?\n?$/, '\n');
}

function renderDocPage(slug, page) {
  const links=[['testing','How it works'],['privacy','Privacy'],['security','Processing & security'],['limitations','Tool limitations'],['terms','Use notice']];
  links.push(['tools','Tool directory']);
  const navigation=links.map(([id,label])=>`<a href="/${id}/"${id===slug?' aria-current="page"':''}>${label}</a>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${page.intro}"><title>${page.title} — FolioCove</title>${pageMetadata(`/${slug}/`,page.title,page.intro)}<link rel="stylesheet" href="/information.css"></head><body><a class="skip-link" href="#content">Skip to content</a><header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="FolioCove home"><img src="/assets/icons/files-coral.svg" width="28" height="28" alt="">FolioCove</a><span class="beta-label">Private beta</span><a class="tools-button" href="/">Browse tools<img src="/assets/icons/arrow-up-right.svg" width="18" height="18" alt=""></a></div></header><div class="reading-layout"><aside><nav class="guide-nav" aria-label="FolioCove guide">${navigation}</nav></aside><main id="content"><div class="page-intro"><h1>${page.title}</h1><p>${page.intro}</p></div><article class="reader" aria-label="${page.title}">${page.body}</article><div class="return-to-tools"><h2>Ready for a little less paperwork?</h2><a class="primary-link" href="/">Find your PDF tool<img src="/assets/icons/arrow-up-right.svg" width="18" height="18" alt=""></a></div></main></div><footer><div class="footer-inner"><p>FolioCove · Documents stay on your device.</p><nav aria-label="Footer">${navigation}</nav></div></footer></body></html>`;
}

await fs.rm(dist, {recursive: true, force: true});
await fs.mkdir(dist, {recursive: true});

await esbuild({
  absWorkingDir: root,
  entryPoints: [path.join(src, 'app', 'index.mjs')],
  outfile: 'dist/assets/app.js',
  bundle: true,
  format: 'esm',
  target: ['es2022'],
  platform: 'browser',
  external: ['/launch.mjs', '/assets/extended.js'],
  logLevel: 'silent'
});

await esbuild({absWorkingDir:root,entryPoints:['extended','qpdf-worker'].map(name=>path.join(src,'app',`${name}.mjs`)),outdir:'dist/assets',splitting:true,bundle:true,format:'esm',target:['es2022'],platform:'browser',external:['node:*'],logLevel:'silent'});
await copyFile(path.join(root,'node_modules','pdfstudio','dist','wasm','qpdf.wasm'),path.join(dist,'assets','qpdf.wasm'));

const appBundlePath = path.join(dist, 'assets', 'app.js');
let appBundle = await fs.readFile(appBundlePath, 'utf8');
appBundle = appBundle.replace(
  /`https:\/\/cdn\.jsdelivr\.net\/npm\/tesseract\.js@v\$\{[^}]+\}\/dist\/worker\.min\.js`/g,
  '`/assets/tesseract/worker.min.js`'
);
await fs.writeFile(appBundlePath, cleanGeneratedText(appBundle));

await copyFile(path.join(src, 'app', 'launch.mjs'), path.join(dist, 'launch.mjs'));
await copyFile(path.join(src, 'styles', 'launch.css'), path.join(dist, 'launch.css'));
await copyFile(path.join(src, 'styles', 'catalog.css'), path.join(dist, 'catalog.css'));
await copyFile(path.join(src, 'styles', 'file-order.css'), path.join(dist, 'file-order.css'));
await copyFile(path.join(src, 'styles', 'results.css'), path.join(dist, 'results.css'));
await copyFile(path.join(src, 'styles', 'information.css'), path.join(dist, 'information.css'));
await fs.cp(path.join(src, 'static', 'previews'), path.join(dist, 'previews'), {recursive: true});
for (const weight of [400, 500, 600, 700]) {
  await copyFile(path.join(root, 'node_modules', '@fontsource', 'dm-sans', 'files', `dm-sans-latin-${weight}-normal.woff2`), path.join(dist, 'assets', 'fonts', `dm-sans-${weight}.woff2`));
}
const designIcons = ['files', 'file-pdf', 'squares-four', 'pencil-simple', 'scan', 'shield-check', 'magnifying-glass', 'upload-simple', 'arrow-up-right', 'arrows-in-simple', 'signature', 'text-aa', 'scissors', 'stack', 'camera', 'eye', 'heart', 'arrows-clockwise', 'lock-simple', 'lock-simple-open', 'image', 'file-doc', 'file-xls', 'file-ppt', 'textbox', 'shapes', 'columns', 'sparkle', 'code', 'list-numbers', 'crop', 'translate'];
for (const icon of designIcons) {
  const assetName = icon === 'upload-simple' ? 'choose-files' : icon;
  await copyFile(path.join(root, 'node_modules', '@phosphor-icons', 'core', 'assets', 'regular', `${icon}.svg`), path.join(dist, 'assets', 'icons', `${assetName}.svg`));
}
const brandIcon = await fs.readFile(path.join(dist, 'assets', 'icons', 'files.svg'), 'utf8');
await writeFile(path.join(dist, 'assets', 'icons', 'files-coral.svg'), brandIcon.replaceAll('currentColor', '#c52949'));
await copyFile(path.join(root, 'node_modules', '@fontsource', 'dm-sans', 'LICENSE'), path.join(dist, 'assets', 'licenses', 'dm-sans.txt'));
await copyFile(path.join(root, 'node_modules', '@phosphor-icons', 'core', 'LICENSE'), path.join(dist, 'assets', 'licenses', 'phosphor.txt'));
await copyFile(path.join(src, 'static', 'manifest.webmanifest'), path.join(dist, 'manifest.webmanifest'));
await copyFile(path.join(src, 'static', 'sw.js'), path.join(dist, 'sw.js'));
await copyFile(path.join(src, 'static', 'tester-results.csv'), path.join(dist, 'tester-results.csv'));
await copyFile(path.join(src, 'static', 'device-pilot.csv'), path.join(dist, 'device-pilot.csv'));

await copyFile(
  path.join(root, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs'),
  path.join(dist, 'assets', 'pdf.worker.min.mjs')
);
await copyPdfJsWasmAssets();

await copyFile(
  path.join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
  path.join(dist, 'assets', 'tesseract', 'worker.min.js')
);
await copyFile(
  path.join(root, 'node_modules', 'tesseract.js-core', 'tesseract-core-simd.wasm.js'),
  path.join(dist, 'assets', 'tesseract', 'tesseract-core-simd.wasm.js')
);
await copyFile(
  path.join(root, 'node_modules', 'tesseract.js-core', 'tesseract-core-simd.wasm'),
  path.join(dist, 'assets', 'tesseract', 'tesseract-core-simd.wasm')
);

const tesseractWorkerPath = path.join(dist, 'assets', 'tesseract', 'worker.min.js');
let tesseractWorker = await fs.readFile(tesseractWorkerPath, 'utf8');
tesseractWorker = tesseractWorker
  .replace('https://cdn.jsdelivr.net/npm/tesseract.js-core@v', '/assets/tesseract')
  .replace('https://cdn.jsdelivr.net/npm/@tesseract.js-data/', 'https://tessdata.projectnaptha.com/4.0.0/');
await fs.writeFile(tesseractWorkerPath, cleanGeneratedText(tesseractWorker));

let homepage = await fs.readFile(path.join(src, 'pages', 'home.html'), 'utf8');
homepage = homepage.replace('%%APP_SCRIPT%%', '/assets/app.js');
const homepageDescription='FolioCove processes selected PDFs on your device. Merge, organize, convert and edit files, with browser-dependent AI and clearly stated tool limits.';
homepage=homepage.replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${homepageDescription}">`);
const homepageSource=homepage;
homepage=homepage.replace('</head>',pageMetadata('/',site.name+' — Private PDF tools',homepageDescription,true)+'</head>');
await writeFile(path.join(dist, 'index.html'), homepage);

const routeSource = homepageSource
  .replace(/<title>.*?<\/title>/, '<title>%%TITLE%% — FolioCove</title>')
  .replace('What do you need to do?', '%%TITLE%%');

for (const [id, slug, title] of core) {
  const description=baseTools[id].copy+' Keep your original and review the tool limitations.';
  let html=routeSource.replaceAll('%%TITLE%%',title).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escapeHtml(description)}">`);
  html=html.replace('</head>',pageMetadata(`/${slug}/`,title,description,true)+'</head>');
  await writeFile(path.join(dist,slug,'index.html'),html);
}

for (const [slug, page] of Object.entries(pages)) {
  await writeFile(path.join(dist, slug, 'index.html'), renderDocPage(slug, page));
}

console.log(`Generated ${core.length} tool routes and ${Object.keys(pages).length} beta information pages.`);

const capabilities=capabilityData(core);
await writeFile(path.join(dist,'capabilities.json'),JSON.stringify(capabilities,null,2)+'\n');
await writeFile(path.join(dist,'tools','index.html'),renderDocPage('tools',{title:'Every tool, with its limits',intro:'A complete guide to FolioCove’s browser PDF tools and supported capabilities.',body:toolDirectory(capabilities)}));
await writeFile(path.join(dist,'docs','capabilities.md'),knowledgeMarkdown(capabilities));
await writeFile(path.join(dist,'llms.txt'),'# FolioCove\n\n> Browser PDF tools with on-device document processing. Owner-private beta; not yet publicly indexed.\n\n## Product and guides\n\n- [Tool directory]('+site.origin+'/tools/): all 88 tools, purposes and limits\n- [How it works]('+site.origin+'/testing/): local processing and beta status\n- [Capabilities]('+site.origin+'/docs/capabilities.md): complete plain-text capability guide\n- [Machine-readable catalog]('+site.origin+'/capabilities.json): tool IDs, input formats, URLs and status\n- [Limitations]('+site.origin+'/limitations/): experimental and unavailable features\n- [Privacy]('+site.origin+'/privacy/): storage and network requests\n\n## Important boundaries\n\nAI summary and translation are browser-dependent. Redaction is experimental. Verified sanitization and PDF/A conversion are unavailable. There is no document-upload endpoint or remote processing API. Support email and physical-device validation remain pending.\n');
await writeFile(path.join(dist,'robots.txt'),'# Owner-private beta; enable discovery only after public-launch approval.\nUser-agent: *\nDisallow: /\n');
