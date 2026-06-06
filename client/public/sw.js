self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    self.clients.claim().then(() => {
      self.registration.unregister().then(() => {
        console.log('Orphaned Service Worker successfully killed.');
      });
    })
  );
});
