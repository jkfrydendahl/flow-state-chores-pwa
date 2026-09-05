import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const root = path.resolve("out");
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
}
const paths = (await files(root)).filter(file => !file.endsWith("/sw.js")).sort();
const hash = createHash("sha256");
for (const file of paths) { hash.update(path.relative(root, file)); hash.update(await readFile(file)); }
const cacheName = `flow-state-${hash.digest("hex").slice(0, 16)}`;
// Error pages may return HTTP 404 on the host, which would abort cache.addAll.
// Only the root document and runtime assets are needed for this one-route app.
const assets = ["/", ...paths.filter(file => /\.(js|css|png|webmanifest|woff2?)$/.test(file)).map(file => "/" + path.relative(root, file).split(path.sep).join("/"))];
const worker = `// Generated from the complete static export. Do not edit.
const CACHE = ${JSON.stringify(cacheName)};
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
// No skipWaiting: updates take over after existing app tabs close.
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('flow-state-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (request.mode === 'navigate' && (url.pathname === '/' || url.pathname === '/index.html')) {
      return (await cache.match('/')) || fetch(request);
    }
    return (await cache.match(request)) || fetch(request);
  })());
});
`;
await writeFile(path.join(root, "sw.js"), worker);
console.log(`Generated ${cacheName} with ${assets.length} offline assets.`);
