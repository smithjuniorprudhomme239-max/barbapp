const CACHE = 'duckensbarber-v3'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Never cache API / Supabase requests
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/')) {
    event.respondWith(fetch(event.request).catch(() => new Response('Offline', { status: 503 })))
    return
  }

  // Network-first for HTML and JS/CSS bundles — always get latest, fall back to cache
  if (
    url.origin === location.origin &&
    (url.pathname === '/' || url.pathname.endsWith('.html') ||
     url.pathname.match(/\.(js|css)$/))
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // Cache-first for static assets (images, fonts, icons)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => new Response('Offline', { status: 503 }))
    })
  )
})
