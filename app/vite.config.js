import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Chemins relatifs : indispensable pour que l'app fonctionne en file:// dans Electron.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
