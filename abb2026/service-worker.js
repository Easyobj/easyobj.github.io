const FONT_CACHE='abb-fonts-v1';
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k.startsWith('abb-fonts-')&&k!==FONT_CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);
  if(req.method!=='GET' || !url.pathname.includes('/assets/fonts/')) return;
  event.respondWith(
    caches.open(FONT_CACHE).then(async cache=>{
      const hit=await cache.match(req);
      if(hit) return hit;
      const res=await fetch(req);
      if(res && res.ok) cache.put(req,res.clone());
      return res;
    })
  );
});