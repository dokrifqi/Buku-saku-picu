/* Service worker Buku Saku PICU.
   - index.html dan manifest: SELALU ambil dari jaringan dulu (tanpa cache HTTP), cache hanya untuk offline.
   - Ikon dan font: cache dulu, diperbarui di latar belakang.
   Mengubah index.html TIDAK perlu mengubah file ini. Naikkan CACHE hanya bila ikon diganti. */
const CACHE = 'saku-picu-v2';
const NET_TIMEOUT = 4000; // ms; lewat dari ini tampilkan versi cache lalu perbarui di latar belakang
const SHELL = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isDocument(req, url) {
  const p = url.pathname;
  return req.mode === 'navigate' || p.endsWith('/') || p.endsWith('/index.html') || p.endsWith('/manifest.webmanifest');
}

async function networkFirst(e, req, url) {
  const cache = await caches.open(CACHE);
  const key = (req.mode === 'navigate' || url.pathname.endsWith('/')) ? './index.html' : req;
  const net = fetch(req.mode === 'navigate' ? new Request(req.url, { cache: 'no-store' }) : new Request(req, { cache: 'no-store' }));
  const save = r => { if (r && r.ok) cache.put(key, r.clone()); return r; };
  const timer = new Promise(res => setTimeout(() => res(null), NET_TIMEOUT));
  try {
    const first = await Promise.race([net.then(save), timer]);
    if (first) return first;
    // jaringan lambat: tampilkan cache bila ada, lanjutkan pembaruan di latar belakang
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) { e.waitUntil(net.then(save).catch(() => {})); return hit; }
    return await net.then(save);
  } catch (err) {
    const hit = await cache.match(key, { ignoreSearch: true }) || await cache.match('./index.html');
    return hit || Response.error();
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: cache dulu, perbarui di latar belakang
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  if (url.origin !== location.origin) return;

  if (isDocument(req, url)) {
    e.respondWith(networkFirst(e, req, url));
    return;
  }

  // Ikon dan aset lain: cache dulu, perbarui di latar belakang
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || Response.error();
  }));
});
