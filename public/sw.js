// public/sw.js
const CACHE_NAME = 'app-v1'
const STATIC_ASSETS = ['/', '/manifest.json']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request)
    }),
  )
})
