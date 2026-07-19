/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision?: string }>;
};
declare const __BUILD_ID__: string;

const CACHE_PREFIX = "exploration-atlas-";
const CACHE_NAME = `${CACHE_PREFIX}${__BUILD_ID__}`;
const precacheUrls = [...new Set(self.__WB_MANIFEST.map((entry) => entry.url))];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(precacheUrls))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  let replacingExistingVersion = false;
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        replacingExistingVersion = keys.some(
          (key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME,
        );
        return Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        );
      })
      .then(() => self.clients.claim())
      .then(async () => {
        const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        clients.forEach((client) => {
          client.postMessage({ type: "ATLAS_UPDATED", buildId: __BUILD_ID__ });
          if (replacingExistingVersion && "navigate" in client) {
            void client.navigate(client.url).catch(() => undefined);
          }
        });
      }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname === "/sw.js") {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("index.html", clone));
          }
          return response;
        })
        .catch(async () => (await caches.match("index.html")) ?? Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            cache.put(event.request, clone);
          }
          return response;
        })
        .catch(() => Response.error());
    }),
  );
});

export {};
