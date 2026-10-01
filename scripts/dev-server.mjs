import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';

const types = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.csv', 'text/csv; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.woff2', 'font/woff2'],
  ['.wasm', 'application/wasm'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8']
]);

function resolveDistPath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const candidate = path.resolve(dist, `.${decoded}`);
  const relative = path.relative(dist, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return candidate;
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const candidate = resolveDistPath(url.pathname);
    if (!candidate) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    let filePath = candidate;
    const stat = await fs.stat(filePath).catch(() => null);
    if (stat?.isDirectory()) filePath = path.join(filePath, 'index.html');
    const ext = path.extname(filePath);
    const body = await fs.readFile(filePath);
    response.writeHead(200, {'content-type': types.get(ext) || 'application/octet-stream'});
    response.end(body);
  } catch (error) {
    response.writeHead(404, {'content-type': 'text/plain; charset=utf-8'});
    response.end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`FolioCove dev server: http://${host}:${port}/`);
  console.log('Serving generated files from dist/. Run npm run build after source changes.');
});
