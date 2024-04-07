import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import wasm from 'vite-plugin-wasm';
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [
      wasm(),
      topLevelAwait(),
      react(),
  ],
  server: {
      port: 3000,
      open: true,
      watch: {
        usePolling: true,
      },
  },
  preview: {
      port: 3000,
  },
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src") },
      { find: "@cornerstonejs/tools", replacement: "@cornerstonejs/tools/dist/umd/index.js" }
    ]
  },
  build: {
    outDir: 'dist',
  },
});
