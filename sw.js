/* navi radio service worker — app-shell offline, network-first for streams/API */
const CACHE = "navi-radio-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Never cache audio streams or radio-browser API; always go to network.
  if (
    request.destination === "audio" ||
    url.hostname.includes("radio-browser") ||
    /\.(mp3|ogg|oga|opus|wav|flac|m4a|aac|webm)(\?|#|$)/i.test(url.pathname)
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // App shell: cache-first, then network with cache update.
  event.respondWith(
    caches.match(request, { ignoreSearch: false }).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
