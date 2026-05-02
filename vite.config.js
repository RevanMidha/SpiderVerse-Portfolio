import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          effects: ['@react-three/postprocessing', 'postprocessing'],
          physics: ['@react-three/rapier'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
