import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build as esbuild} from 'esbuild';
import {core, pages} from '../src/content/routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

async function copyFile(from, to) {
  await fs.mkdir(path.dirname(to), {recursive: true});
  await fs.copyFile(from, to);
}

async function writeFile(to, content) {
  await fs.mkdir(path.dirname(to), {recursive: true});
  await fs.writeFile(to, content);
}

function renderDocPage(slug, page) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${page.title} — PrivyPDF</title><link rel="stylesheet" href="/launch.css"></head><body class="policy"><nav><a href="/">← PrivyPDF tools</a></nav><h1>${page.title}</h1>${page.body}<footer><a href="/privacy/">Privacy</a> · <a href="/security/">Security</a> · <a href="/limitations/">Limitations</a> · <a href="/testing/">Testing</a></footer></body></html>`;
}

await fs.rm(dist, {recursive: true, force: true});
await fs.mkdir(dist, {recursive: true});

await esbuild({
  absWorkingDir: root,
  entryPoints: ['././src/app/index.mjs'],
  outfile: 'dist/assets/app.js',
  bundle: true,
  format: 'esm',
  target: ['es2022'],
  platform: 'browser',
  external: ['/launch.mjs'],
  logLevel: 'silent'
});

const appBundlePath = path.join(dist, 'assets', 'app.js');
let appBundle = await fs.readFile(appBundlePath, 'utf8');
appBundle = appBundle.replace(
  /`https:\/\/cdn\.jsdelivr\.net\/npm\/tesseract\.js@v\$\{[^}]+\}\/dist\/worker\.min\.js`/g,
  '`/assets/tesseract/worker.min.js`'
);
await fs.writeFile(appBundlePath, appBundle);

await copyFile(path.join(src, 'app', 'launch.mjs'), path.join(dist, 'launch.mjs'));
await copyFile(path.join(src, 'styles', 'launch.css'), path.join(dist, 'launch.css'));
await copyFile(path.join(src, 'static', 'manifest.webmanifest'), path.join(dist, 'manifest.webmanifest'));
await copyFile(path.join(src, 'static', 'sw.js'), path.join(dist, 'sw.js'));
await copyFile(path.join(src, 'static', 'tester-results.csv'), path.join(dist, 'tester-results.csv'));

await copyFile(
  path.join(root, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs'),
  path.join(dist, 'assets', 'pdf.worker.min.mjs')
);

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
await fs.writeFile(tesseractWorkerPath, tesseractWorker);

let homepage = await fs.readFile(path.join(src, 'pages', 'home.html'), 'utf8');
homepage = homepage.replace('%%APP_SCRIPT%%', '/assets/app.js');
await writeFile(path.join(dist, 'index.html'), homepage);

const routeSource = homepage
  .replace(/<title>.*?<\/title>/, '<title>%%TITLE%% — PrivyPDF</title>')
  .replace('What do you need to do?', '%%TITLE%%');

for (const [, slug, title] of core) {
  await writeFile(path.join(dist, slug, 'index.html'), routeSource.replaceAll('%%TITLE%%', title));
}

for (const [slug, page] of Object.entries(pages)) {
  await writeFile(path.join(dist, slug, 'index.html'), renderDocPage(slug, page));
}

console.log(`Generated ${core.length} tool routes and ${Object.keys(pages).length} beta information pages.`);
