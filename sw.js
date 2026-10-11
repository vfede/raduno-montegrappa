/* Raduno del Montegrappa — offline cache (precache + network update) */
const CACHE = 'raduno-v1';
const ASSETS = [
  './',
  './index.html',
  './percorso-raduno-montegrappa.pdf',
  './img/t1.jpg',
  './img/t2-foto.jpg',
  './img/t2-mappa.jpg',
  './img/t3-foto.jpg',
  './img/t3-mappa.jpg',
  './img/t4.jpg',
  './img/t5.jpg',
  './img/t6.jpg',
  './img/t7.jpg',
  './img/t8.jpg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var cp = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
