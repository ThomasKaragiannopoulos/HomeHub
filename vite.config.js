import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// OASA sends no CORS headers, so the dev server proxies it.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/oasa": {
        target: "https://telematics.oasa.gr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oasa/, "/api/"),
      },
    },
  },
});
