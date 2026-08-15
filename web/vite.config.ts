import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      "@engine": resolve(__dirname, "../src/engine"),
      "@domain": resolve(__dirname, "../src/types"),
      "@data": resolve(__dirname, "../data"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
