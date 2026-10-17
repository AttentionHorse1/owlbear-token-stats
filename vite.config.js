
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "/owlbear-token-stats/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        viewer: resolve(import.meta.dirname, "viewer.html"),
      },
    },
  },
});
