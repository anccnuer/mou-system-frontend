import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'vite-plugin-vue-mcp';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), VueMcp()],
})
