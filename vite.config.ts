import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  base: '/carehub/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-404',
      closeBundle() {
        const distDir = path.resolve(import.meta.dirname ?? process.cwd(), 'dist')
        const indexPath = path.join(distDir, 'index.html')
        const notFoundPath = path.join(distDir, '404.html')
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath)
        }
      },
    },
  ],
})

