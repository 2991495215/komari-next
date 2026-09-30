self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    (async function () {
      if (self.caches && caches.keys) {
        var keys = await caches.keys();
        await Promise.all(keys.map(function (key) { return caches.delete(key); }));
      }
      if (self.clients && clients.claim) {
        await clients.claim();
      }
      if (self.registration && self.registration.unregister) {
        await self.registration.unregister();
      }
      if (self.clients && clients.matchAll) {
        var windows = await clients.matchAll({ type: "window" });
        windows.forEach(function (client) {
          if (client.url) client.navigate(client.url);
        });
      }
    })()
  );
});
