import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Flag so the app can show a toast after reload
const wasUpdated = sessionStorage.getItem("pwa-just-updated");
if (wasUpdated) {
  sessionStorage.removeItem("pwa-just-updated");
  // Show toast after React mounts (slight delay for toast system to init)
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("pwa-updated"));
  }, 1000);
}

// Register SW with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    // Mark that an update is about to happen, then activate
    sessionStorage.setItem("pwa-just-updated", "true");
    updateSW(true);
  },
  onOfflineReady() {
    console.log("[PWA] App ready for offline use");
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    }
  },
});

createRoot(document.getElementById("root")!).render(<App />);
