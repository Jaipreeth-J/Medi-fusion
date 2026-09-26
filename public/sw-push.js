/**
 * Push notification handler for the service worker.
 * This file is imported by the main service worker to handle push events
 * when the app is closed/backgrounded.
 */

// Handle incoming push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Medifusion",
      body: event.data.text(),
    };
  }

  const title = data.title || "💊 Medication Reminder";
  const options = {
    body: data.body || "Time to take your medication",
    icon: data.icon || "/pwa-192x192.png",
    badge: data.badge || "/pwa-192x192.png",
    tag: data.tag || "medication-reminder",
    renotify: true,
    requireInteraction: data.requireInteraction !== false,
    silent: false,
    vibrate: [300, 100, 300, 100, 400, 100, 300],
    data: data.data || {},
    actions: [
      { action: "take", title: "✓ Mark as Taken" },
      { action: "snooze", title: "⏰ Snooze 10min" },
    ],
  };

  // Notify all open clients to play alarm sound
  const notifyClients = self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "PLAY_MEDICATION_ALARM" });
      });
    });

  event.waitUntil(
    Promise.all([
      notifyClients,
      self.registration.showNotification(title, options),
    ])
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  const url = data.url || "/medications";

  if (action === "take") {
    // Open the app to medications page with a take action
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        // Try to focus an existing window
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            client.postMessage({
              type: "MEDICATION_TAKEN",
              medicationId: data.medicationId,
              scheduledTime: data.scheduledTime,
            });
            return;
          }
        }
        // Open new window
        return self.clients.openWindow(url);
      })
    );
  } else if (action === "snooze") {
    // Schedule another notification in 10 minutes
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification(event.notification.title, {
            body: event.notification.body + " (Snoozed)",
            icon: "/pwa-192x192.png",
            badge: "/pwa-192x192.png",
            tag: event.notification.tag + "_snoozed",
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 300],
            data: data,
            actions: [
              { action: "take", title: "✓ Mark as Taken" },
              { action: "dismiss", title: "Dismiss" },
            ],
          });
          resolve();
        }, 10 * 60 * 1000); // 10 minutes
      })
    );
  } else {
    // Default click - open the app
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
    );
  }
});
