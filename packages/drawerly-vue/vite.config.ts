import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
      insertTypesEntry: true,
    }),
    {
      name: 'copy-shared-css',
      closeBundle() {
        let srcCss: string

        try {
          srcCss = require.resolve('@drawerly/shared/styles.css')
        }
        catch {
          throw new Error(
            '[@drawerly/vue] Could not resolve "@drawerly/shared/styles.css". Make sure @drawerly/shared is built and exported correctly.',
          )
        }

        const distCss = path.resolve(__dirname, 'dist/style.css')

        if (!fs.existsSync(srcCss)) {
          throw new Error(
            `[@drawerly/vue] Resolved styles.css from @drawerly/shared does not exist:\n${srcCss}`,
          )
        }

        fs.copyFileSync(srcCss, distCss)
      },
    },
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DrawerlyVue',
      fileName: format => (format === 'es' ? 'index.mjs' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@drawerly/core', '@drawerly/shared'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
    emptyOutDir: true,
    sourcemap: true,
  },
})
