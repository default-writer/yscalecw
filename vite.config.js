import { defineConfig } from "vite";

export default defineConfig({
  base: "/yscalecw/",
  plugins: [],
  server: {
    open: false,
  },
  build: {
    outDir: "dist",
  },
});
