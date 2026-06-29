import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react().map(p => ({ ...p }))
  ],

  server: {
    port: 3000
  }
})