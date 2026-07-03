const CACHE = 'duckensbarber-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Never cache API / Supabase requests — always go network first
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/')) {
    event.respondWith(fetch(event.request).catch(() => new Response('Offline', { status: 503 })))
    return
  }

  // Cache-first for static assets (JS, CSS, images, fonts)
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request)
      if (cached) return cached

      try {
        const response = await fetch(event.request)
        if (response.ok && (url.pathname.match(/\.(js|css|png|jpg|svg|woff2|ico)$/) || url.origin === location.origin)) {
          const clone = response.clone()
          const cache = await caches.open(CACHE)
          cache.put(event.request, clone)
        }
        return response
      } catch {
        return cached || new Response('Offline', { status: 503 })
      }
    })()
  )
})