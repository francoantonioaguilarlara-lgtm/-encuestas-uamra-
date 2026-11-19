// Guarda la app en el celular para que abra aunque no haya internet.
const VERSION = "encuestas-v1";
const ARCHIVOS = ["./", "index.html", "manifest.json", "icono.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // la nube no se guarda
  // Primero intenta internet (para tener la versión nueva); si no hay, usa la copia guardada
  e.respondWith(fetch(e.request)
    .then((r) => { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copia)); return r; })
    .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
});
