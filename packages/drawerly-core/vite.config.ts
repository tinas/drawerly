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
      tsconfigPath: path.resolve(import.meta.dirname, 'tsconfig.json'),
    }),
    {
      name: 'copy-css',
      closeBundle() {
        const srcCss = path.resolve(import.meta.dirname, 'src/styles.css')
        const distCss = path.resolve(import.meta.dirname, 'dist/styles.css')

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
        index: path.resolve(import.meta.dirname, 'src/index.ts'),
        dom: path.resolve(import.meta.dirname, 'src/dom/index.ts'),
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
