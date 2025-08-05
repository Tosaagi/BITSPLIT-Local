import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Pass your theme extensions directly to the plugin
    tailwindcss({
      theme: {
        extend: {
          fontFamily: {
            myfont: ['myfont', 'sans-serif']
          }
        }
      }
    })
  ],
  preview: {
    allowedHosts: ['bitsplit-cnh9ezhxgyh9hpf2.eastus-01.azurewebsites.net']
  }
})