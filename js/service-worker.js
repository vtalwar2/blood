var dataCacheName = 'bloodBank-2';
var cacheName = 'bloodBank-final-2';
var filesToCache = [
  '/',
  '/index.html',
  '/js/app.js',
  '/css/custom.css',
  '/css/font.css', 
  '/css/materialize.css',
  '/css/materialize.min.css',
  '/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
  '/images/Profile_Avatar.png',
  '/images/Profile_background.png',
  '/js/materialize.js',
  '/js/materialize.min.js'
];

self.addEventListener('install', function (e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function (e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (res) {
      if (res) {
        return res;
      }
      requestBackend(event);
    })
  )
});

function requestBackend(event) {
  var url = event.request.clone();
  return fetch(url).then(function (res) {
    //if not a valid response send the error
    if (!res || res.status !== 200 || res.type !== 'basic') {
      return res;
    }

    var response = res.clone();

    caches.open(CACHE_VERSION).then(function (cache) {
      cache.put(event.request, response);
    });

    return res;
  })
}
