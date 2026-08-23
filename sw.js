const CACHE="gardes-v2-2.0.1";
const CORE=[
  "./","./index.html","./styles.css?v=2.0.1","./app.js?v=2.0.1",
  "./repositories.js?v=2.0.1","./config.js?v=2.0.1","./profile.js?v=2.0.1",
  "./manifest.webmanifest","./assets/icon-192.png","./assets/icon-512.png","./assets/apple-touch-icon.png"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});
self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      })
      .catch(()=>caches.match(event.request).then(r=>r||caches.match("./index.html")))
  );
});