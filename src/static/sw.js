// Retire old cache-first shells; do not retain authenticated private pages offline.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('privypdf-shell-'))await caches.delete(key);
  await self.clients.claim();
})()));
// Network-only. Full offline support requires bundled dependencies and a separate audit.
