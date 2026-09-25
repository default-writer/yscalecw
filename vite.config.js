import { defineConfig } from "vite";

export default defineConfig({
  base: "/cipher/",
  plugins: [],
  server: {
    open: false,
  },
  build: {
    outDir: "dist",
  },
});
