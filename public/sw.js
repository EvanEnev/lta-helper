const VERSION = 'v3'
const STATIC_CACHE = `lta-static-${VERSION}`
const RUNTIME_CACHE = `lta-runtime-${VERSION}`
const PAGES_CACHE = `lta-pages-${VERSION}`
const META_CACHE = `lta-meta-${VERSION}`
const OFFLINE_URL = '/offline.html'
const ICON = '/web-app-manifest-192x192.png'
const RUNTIME_LIMIT = 120
const PAGES_LIMIT = 40
const WARM_FRESH_MS = 60 * 1000
const ASSETS_PER_PAGE = 80

const PRECACHE = [OFFLINE_URL, ICON, '/web-app-manifest-512x512.png']
const NO_CACHE_PATHS = ['/login', '/register', OFFLINE_URL]
const USER_KEY = '/__lta-user'

const staleServed = new Map()

const DEV = new URL(self.location.href).searchParams.has('dev')

const STATIC_ASSET = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf)$/i
const NEXT_ASSET = /\/_next\/static\/[A-Za-z0-9_\-./~%]+\.(?:js|css|woff2)/g

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache =>
        Promise.all(
          PRECACHE.map(url =>
            cache.add(new Request(url, {cache: 'reload'})).catch(() => {}),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keep = [STATIC_CACHE, RUNTIME_CACHE, PAGES_CACHE, META_CACHE]
      const names = await caches.keys()

      await Promise.all(
        names
          .filter(name => !keep.includes(name))
          .map(name => caches.delete(name)),
      )

      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable()
      }

      await self.clients.claim()
    })(),
  )
})

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  for (const key of keys.slice(0, Math.max(0, keys.length - limit))) {
    await cache.delete(key)
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) return cached

  const response = await fetch(request)

  if (response.ok) cache.put(request, response.clone())

  return response
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const network = fetch(request)
    .then(response => {
      if (response.ok) {
        cache
          .put(request, response.clone())
          .then(() => trim(cacheName, RUNTIME_LIMIT))
      }

      return response
    })
    .catch(() => cached)

  return cached || network
}

async function stamped(response) {
  const headers = new Headers(response.headers)

  headers.set('x-cached-at', String(Date.now()))

  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

async function cacheAssetsOf(html) {
  const found = [...new Set(html.match(NEXT_ASSET) || [])].slice(
    0,
    ASSETS_PER_PAGE,
  )
  const cache = await caches.open(STATIC_CACHE)

  await Promise.all(
    found.map(async path => {
      if (await cache.match(path)) return

      try {
        const response = await fetch(path)

        if (response.ok) await cache.put(path, response)
      } catch {}
    }),
  )
}

async function storePage(url, response, withAssets) {
  const path = new URL(response.url || url).pathname

  if (!response.ok || response.type === 'opaqueredirect') return
  if (
    NO_CACHE_PATHS.includes(path) ||
    NO_CACHE_PATHS.includes(new URL(url).pathname)
  )
    return
  if (!(response.headers.get('content-type') || '').includes('text/html'))
    return

  const cache = await caches.open(PAGES_CACHE)

  if (withAssets && !DEV) {
    response
      .clone()
      .text()
      .then(cacheAssetsOf)
      .catch(() => {})
  }

  await cache.put(url, await stamped(response))
  await trim(PAGES_CACHE, PAGES_LIMIT)
}

async function matchPage(request) {
  const cache = await caches.open(PAGES_CACHE)
  const url = new URL(request.url)

  return (
    (await cache.match(url.origin + url.pathname + url.search)) ||
    (await cache.match(url.origin + url.pathname, {ignoreSearch: true}))
  )
}

async function navigate(event) {
  const {request} = event

  try {
    const preload = await event.preloadResponse
    const response = preload || (await fetch(request))

    staleServed.delete(request.url)

    if (!response.redirected) {
      event.waitUntil(
        storePage(request.url, response.clone(), false).catch(() => {}),
      )
    }

    return response
  } catch {
    const cached = await matchPage(request)

    if (cached) {
      staleServed.set(request.url, Date.now())

      return cached
    }

    const cache = await caches.open(STATIC_CACHE)

    return (
      (await cache.match(OFFLINE_URL)) ||
      new Response('Нет сети', {
        status: 503,
        headers: {'Content-Type': 'text/plain; charset=utf-8'},
      })
    )
  }
}

async function warm(urls) {
  const cache = await caches.open(PAGES_CACHE)

  for (const path of urls) {
    const url = new URL(path, self.location.origin).href
    const existing = await cache.match(url)
    const at = Number(existing && existing.headers.get('x-cached-at'))

    if (at && Date.now() - at < WARM_FRESH_MS) continue

    try {
      const response = await fetch(url, {
        credentials: 'same-origin',
        redirect: 'manual',
        headers: {Accept: 'text/html'},
      })

      await storePage(url, response, true)
    } catch {
      return
    }
  }
}

async function setUser(id) {
  const meta = await caches.open(META_CACHE)
  const previous = await meta.match(USER_KEY)
  const current = previous ? await previous.text() : null

  if (current !== null && current !== String(id)) {
    await caches.delete(PAGES_CACHE)
  }

  await meta.put(USER_KEY, new Response(String(id)))
}

async function clearUserData() {
  await caches.delete(PAGES_CACHE)
  await caches.delete(META_CACHE)
}

async function cachedAt(path) {
  const cache = await caches.open(PAGES_CACHE)
  const url = new URL(path, self.location.origin)
  const hit =
    (await cache.match(url.origin + url.pathname + url.search)) ||
    (await cache.match(url.origin + url.pathname, {ignoreSearch: true}))

  return {
    at: hit ? Number(hit.headers.get('x-cached-at')) || null : null,
    stale: Date.now() - (staleServed.get(url.href) || 0) < 120000,
  }
}

self.addEventListener('fetch', event => {
  const {request} = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/socket.io/')) return

  if (request.mode === 'navigate') {
    event.respondWith(navigate(event))
    return
  }

  if (DEV) return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (
    url.pathname.startsWith('/_next/image') ||
    STATIC_ASSET.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
  }
})

self.addEventListener('push', event => {
  let data = {}

  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = {body: event.data ? event.data.text() : ''}
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'LTA Helper', {
      body: data.body || '',
      icon: ICON,
      badge: ICON,
      tag: data.tag,
      data: {url: data.url || '/'},
    }),
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const target = new URL(
    (event.notification.data && event.notification.data.url) || '/',
    self.location.origin,
  )

  if (target.origin !== self.location.origin) return

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus()

          if ('navigate' in client) {
            await client.navigate(target.href).catch(() => {})
          }

          return
        }
      }

      await self.clients.openWindow(target.href)
    })(),
  )
})

self.addEventListener('message', event => {
  const data = event.data || {}

  if (data.type === 'SKIP_WAITING') self.skipWaiting()

  if (data.type === 'SET_USER') event.waitUntil(setUser(data.id))

  if (data.type === 'WARM' && Array.isArray(data.urls)) {
    event.waitUntil(warm(data.urls.filter(url => typeof url === 'string')))
  }

  if (data.type === 'CLEAR_USER_DATA') event.waitUntil(clearUserData())

  if (data.type === 'CACHED_AT' && event.ports[0]) {
    event.waitUntil(
      cachedAt(String(data.path)).then(info =>
        event.ports[0].postMessage(info),
      ),
    )
  }
})
