const ASSET_CACHE='abb-static-v5104';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>(k.startsWith('abb-fonts-')||k.startsWith('abb-static-'))&&k!==ASSET_CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);
  if(req.method!=='GET' || (!url.pathname.includes('/assets/')&&!url.pathname.endsWith('/favicon.svg'))) return;
  event.respondWith(
    caches.open(ASSET_CACHE).then(async cache=>{
      const hit=await cache.match(req);
      if(hit) return hit;
      try{
        const res=await fetch(req);
        if(res && res.ok) await cache.put(req,res.clone());
        return res;
      }catch(error){
        if(hit) return hit;
        throw error;
      }
    })
  );
});
