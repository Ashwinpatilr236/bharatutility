/**
 * BharatUtility Service Worker
 * Progressive Web App offline caching & performance optimization engine
 */

const CACHE_NAME = 'bharatutility-pwa-v1';
const OFFLINE_FALLBACK_URL = '/';

// Core assets to pre-cache immediately upon install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/icons/apple-touch-icon.png',
];

// Install Event: Pre-cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-cache non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear outdated caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[PWA SW] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST, PUT, DELETE) and Supabase/API backend calls
  if (request.method !== 'GET' || url.origin.includes('supabase.co')) {
    return;
  }

  // 1. Navigation / HTML Document requests: Network-First with Cache Fallback
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match(OFFLINE_FALLBACK_URL);
          if (fallback) return fallback;
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>BharatUtility Offline</title></head><body style="font-family:sans-serif;text-align:center;padding:40px;"><h2>You are offline</h2><p>Please reconnect to the internet to load new tools.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts): Cache-First with Background Revalidation
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2|woff|ttf|ico)$/) ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch fresh copy in background for next time (Stale-While-Revalidate)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Fallback for other GET requests
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
