import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('framer-motion') || id.includes('recharts') || id.includes('@radix-ui')) return 'vendor-ui';
            if (id.includes('@tanstack/react-query')) return 'vendor-query';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('jspdf')) return 'vendor-pdf';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // PWA Configuration
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "Medifusion - AI Health Assistant",
        short_name: "Medifusion",
        description: "Your personal AI-powered health companion for tracking vitals, symptoms, medications, and mental wellness.",
        theme_color: "#14b8a6",
        background_color: "#0a0a0b",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        categories: ["health", "medical", "lifestyle"],
      },
      workbox: {
        // Increase file size limit to handle large chunks
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        // Cache strategies for offline support
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Do NOT use navigateFallback to offline.html — it causes false offline on refresh
        // Instead, the app handles offline state via useNetworkStatus hook
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/functions/, /^\/~oauth/, /^\/auth/, /^\/offline\.html/],
        // Import the push notification handler into the service worker
        importScripts: ["/sw-push.js"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache ONLY public avatars from Supabase storage.
            // NEVER cache authenticated REST endpoints (/rest/v1/*), auth (/auth/v1/*), or Edge Functions (/functions/v1/*)
            // to protect sensitive patient health data from unencrypted CacheStorage exposure.
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/avatars\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-public-avatars",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}));
