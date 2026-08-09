/// <reference types="vitest/config" />

import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      outDirs: 'dist',
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
    }),
    {
      name: 'copy-css',
      closeBundle() {
        const srcCss = path.resolve(__dirname, 'src/styles.css')
        const distCss = path.resolve(__dirname, 'dist/styles.css')

        if (!fs.existsSync(srcCss)) {
          throw new Error('[@drawerly/core] src/styles.css not found.')
        }

        fs.copyFileSync(srcCss, distCss)
      },
    },
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        dom: path.resolve(__dirname, 'src/dom/index.ts'),
      },
      fileName: (_format, name) => `${name}.mjs`,
      formats: ['es'],
    },
    emptyOutDir: true,
    sourcemap: true,
  },
  test: {
    globals: true,
  },
})
