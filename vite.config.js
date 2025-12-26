// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // CRUCIAL : force les chemins relatifs pour Electron
  build: {
    outDir: 'dist',
  }
})