// Service Worker Actumoto.tn — Notifications Push Natives (VAPID)

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: "actumoto.tn",
      body: event.data.text(),
    };
  }

  const title = data.title || "actumoto.tn — Nouveauté Moto";
  const options = {
    body: data.body || "Découvrez les dernières nouveautés et offres sur actumoto.tn",
    icon: data.icon || "/img/icon-192x192.png",
    badge: data.badge || "/img/favicon-32x32.png",
    image: data.image || undefined,
    tag: data.tag || "actumoto-promo",
    renotify: true,
    vibrate: [120, 60, 120],
    data: {
      url: data.url || "/",
    },
    actions: [
      {
        action: "open",
        title: "Voir maintenant",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl).catch(() => {});
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
