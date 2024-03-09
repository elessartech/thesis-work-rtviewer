import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
      react()
  ],
  server: {
      port: 3000,
      open: true,
  },
  preview: {
      port: 3000,
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
  },
});
