// Cache only public visual assets. Never persist authenticated pages, API data or photos.
const CACHE='beingwell-public-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/icon.svg']))));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(new URL(e.request.url).pathname==='/icon.svg')e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
