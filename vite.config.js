import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// OASA and the news feeds are proxied by the dev server (no CORS headers).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/oasa": {
        target: "https://telematics.oasa.gr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oasa/, "/api/"),
      },
      "/news/techcrunch": {
        target: "https://techcrunch.com",
        changeOrigin: true,
        rewrite: () => "/category/artificial-intelligence/feed/",
      },
      "/news/mit": {
        target: "https://www.technologyreview.com",
        changeOrigin: true,
        rewrite: () => "/topic/artificial-intelligence/feed",
      },
    },
  },
});
