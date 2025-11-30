import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
      insertTypesEntry: true,
    }),
    {
      name: 'copy-css',
      closeBundle() {
        const srcCss = path.resolve(__dirname, 'src/styles.css')
        const distCss = path.resolve(__dirname, 'dist/styles.css')

        if (!fs.existsSync(srcCss)) {
          throw new Error('[@drawerly/shared] src/styles.css not found.')
        }

        fs.copyFileSync(srcCss, distCss)
      },
    },
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DrawerlyShared',
      fileName: format => (format === 'es' ? 'index.mjs' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@drawerly/core'],
      output: {
        exports: 'named',
      },
    },
    emptyOutDir: true,
    sourcemap: true,
  },
})
