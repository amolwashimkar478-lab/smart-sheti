// ================================
// OneSignal + PWA Combined Service Worker
// ================================

importScripts(
  "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js"
);

// ================================
// Workbox
// ================================

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);

const CACHE = "pwabuilder-page";

const offlineFallbackPage = "index.html";


// ================================
// Skip Waiting
// ================================

self.addEventListener("message", (event) => {

  if (
    event.data &&
    event.data.type === "SKIP_WAITING"
  ) {

    self.skipWaiting();

  }

});


// ================================
// Install
// ================================

self.addEventListener("install", async (event) => {

  event.waitUntil(

    caches.open(CACHE)
      .then((cache) => {

        return cache.add(
          offlineFallbackPage
        );

      })

  );

});


// ================================
// Navigation Preload
// ================================

if (
  workbox.navigationPreload.isSupported()
) {

  workbox.navigationPreload.enable();

}


// ================================
// Fetch
// ================================

self.addEventListener("fetch", (event) => {

  if (
    event.request.mode === "navigate"
  ) {

    event.respondWith(

      (async () => {

        try {

          const preloadResp =
            await event.preloadResponse;

          if (preloadResp) {

            return preloadResp;

          }

          const networkResp =
            await fetch(event.request);

          return networkResp;

        } catch (error) {

          const cache =
            await caches.open(CACHE);

          const cachedResp =
            await cache.match(
              offlineFallbackPage
            );

          return cachedResp;

        }

      })()

    );

  }

});
