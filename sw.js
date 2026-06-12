const CACHE_NAME = "famat-pedidos-v3";
const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/catalogo-famat.js",
  "/supabase-famat.js",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png"
];

const NETWORK_FIRST_FILES = ["/script.js", "/catalogo-famat.js", "/supabase-famat.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Network-first para llamadas a Supabase / APIs externas.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-first para navegación (HTML), con fallback a caché.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match("/index.html")))
    );
    return;
  }

  // Network-first para JS del catálogo (siempre versión nueva).
  if (NETWORK_FIRST_FILES.some((path) => url.pathname.endsWith(path))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first para el resto de recursos del mismo origen.
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
      );
    })
  );
});
