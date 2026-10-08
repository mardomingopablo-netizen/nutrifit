const CACHE_NAME = 'nutrifit-v4'

self.addEventListener('install', () => {
  // Activa el nuevo SW inmediatamente, sin esperar.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  let url
  try { url = new URL(req.url) } catch { return }

  // No interceptamos la API ni peticiones a otros dominios.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  // Navegaciones (abrir una página): SIEMPRE red primero, así nunca se queda
  // una versión antigua rota. Si no hay red, usa la última guardada.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(req, clone).catch(() => {}))
          return res
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/')))
    )
    return
  }

  // Recursos estáticos (JS/CSS/imágenes con hash): caché primero, rápido y
  // válido offline. Solo se cachea si la respuesta es correcta.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(req, clone).catch(() => {}))
        }
        return res
      })
    })
  )
})
