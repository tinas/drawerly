import fs from 'node:fs'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

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
      name: 'copy-css',
      closeBundle() {
        const srcCss = path.resolve(__dirname, 'src/styles.css')
        const distCss = path.resolve(__dirname, 'dist/style.css')

        if (!fs.existsSync(srcCss)) {
          throw new Error('[@drawerly/vue] src/styles.css not found.')
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
      external: ['vue', '@drawerly/core'],
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
