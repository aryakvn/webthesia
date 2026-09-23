import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

// HTTPS + LAN host so phones/tablets can load the dev server: WebMIDI, WebUSB and
// (on iOS) pointer events all need a secure context, which plain http://192.168.x.x is not.
// The cert is self-signed, so the device shows a warning once — see README.
export default defineConfig({
  plugins: [vue(), basicSsl()],
  server: { host: true },
  preview: { host: true },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
