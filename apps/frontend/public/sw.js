// Service Worker for PWA
const CACHE_NAME = 'aicetro-v1.0.0'
const STATIC_CACHE = 'aicetro-static-v1'
const DYNAMIC_CACHE = 'aicetro-dynamic-v1'

const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_URLS)
      })
      .then(() => {
        console.log('[SW] Skip waiting')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Claiming clients')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }
  
  // Skip API requests (always use network)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Network unavailable' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        })
    )
    return
  }
  
  // Use cache-first strategy for static assets
  if (STATIC_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response
          }
          
          return fetch(request)
            .then((response) => {
              return caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, response.clone())
                  return response
                })
            })
        })
    )
    return
  }
  
  // Use network-first strategy for everything else
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response before caching
        const responseClone = response.clone()
        
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(request, responseClone)
          })
        
        return response
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request)
          .then((response) => {
            if (response) {
              return response
            }
            
            // Return offline page if nothing in cache
            if (request.destination === 'document') {
              return caches.match('/index.html')
            }
            
            return new Response('Offline', { status: 503 })
          })
      })
  )
})

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions())
  }
})

async function syncTransactions() {
  try {
    // Get pending transactions from IndexedDB
    // Retry failed API calls
    console.log('[SW] Syncing transactions...')
    
    // Implementation would go here
    return Promise.resolve()
  } catch (error) {
    console.error('[SW] Sync failed:', error)
    throw error
  }
}

// Push notifications (for future)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)
  
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'AIcetro Notification'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data || '/'
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if window is already open
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }
          
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})
