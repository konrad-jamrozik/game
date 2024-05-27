/* eslint-disable tsdoc/syntax */
/// <reference types="vitest" />
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
// https://vitest.dev/guide/#configuring-vitest
export default defineConfig({
  test: {
    setupFiles: ['./test/vitest.setup.ts'],
    environment: 'jsdom',
    testTimeout: 30_000,
    coverage: {
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
    chaiConfig: {
      includeStack: true,
    },
  },
})
