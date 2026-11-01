/* ThuKha service worker — installability only, not offline-first.
   ThuKha needs the network for login (Supabase), AI generation and
   token balances, so pages are NETWORK-FIRST and fall back to the
   cache only when offline. It never caches /api/ requests or
   cross-origin requests (Supabase, providers), so auth and
   generation can never go stale. Bump CACHE when this file changes. */
const CACHE = "thukha-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(["/", "/icon-192.png", "/icon-512.png"])).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Only same-origin GET, never API / auth / provider traffic.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache only successful, same-origin (basic) responses.
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(event.request)),
  );
});
