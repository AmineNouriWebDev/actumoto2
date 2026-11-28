// Service Worker Actumoto.tn — Notifications Push Natives (VAPID)

self.addEventListener("install", () => {
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
  } catch {
    data = {
      title: "actumoto.tn",
      body: event.data.text(),
    };
  }

  const title = data.title || "actumoto.tn — Nouveauté Moto";
  const baseOptions = {
    body: data.body || "Découvrez les dernières nouveautés et offres sur actumoto.tn",
    icon: data.icon || "/img/icon-192x192.png",
    badge: data.badge || "/img/favicon-32x32.png",
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

  const options = data.image
    ? { ...baseOptions, image: data.image }
    : baseOptions;

  event.waitUntil(
    self.registration.showNotification(title, options).catch(() => {
      // Repli sans image/actions si le navigateur refuse l'image externe
      return self.registration.showNotification(title, {
        body: baseOptions.body,
        icon: "/img/icon-192x192.png",
        data: baseOptions.data,
      });
    })
  );
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
