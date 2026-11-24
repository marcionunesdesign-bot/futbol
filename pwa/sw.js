/* FUTBOL — service worker: rede primeiro (sempre a versão nova), cache como reserva offline.
   Áudio (música e sons) NÃO passa pelo service worker: no iPhone isso trava o streaming. */
const C='futbol-v3';const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;const u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||u.pathname.includes('/api/')||/\/(mus|snd)\//.test(u.pathname)||/\.(mp3|ogg|m4a|wav)$/i.test(u.pathname)||r.headers.has('range'))return;
  e.respondWith((r.mode==='navigate'||/\/(index\.html)?$/.test(u.pathname)?fetch(u.href,{cache:'no-store',credentials:'same-origin'}):fetch(r)).then(res=>{if(res.ok&&res.status===200){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))))});
