/// <reference types="vitest" />
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
// https://vitest.dev/guide/#configuring-vitest
export default defineConfig({
  test: {
    setupFiles: ['../VitestSetup.ts'],
  },
})
