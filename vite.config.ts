import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/adifa-fisheries/', // MUST match repo name
  build: {
    outDir: 'dist'
  }
})
