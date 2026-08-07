import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig({
  server: {
    host: true,
    port: 3000,
    watch: { usePolling: true },
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 3000,
    allowedHosts: true,
  },

  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tanstackStart(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    viteReact(),
  ],
})

export default config
