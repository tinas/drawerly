// @ts-check
import path from 'node:path'
import { createTypeDocApp } from './typedoc-markdown.mjs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const SHARED = {
  tsconfig: path.resolve(__dirname, './typedoc.tsconfig.json'),
  textContentMappings: {
    'title.indexPage': 'API Reference',
    'title.memberPage': '{name}',
  },
  categorizeByGroup: true,
  githubPages: false,
  readme: 'none',
  indexFormat: 'table',
  disableSources: true,
  useCodeBlocks: true,
  plugin: ['typedoc-plugin-markdown', 'typedoc-vitepress-theme'],
}

/**
 * @param {{ out: string, entryPoints: string[] }} config
 */
function run(config) {
  return createTypeDocApp({
    ...SHARED,
    ...config,
    out: path.resolve(__dirname, config.out),
    entryPoints: config.entryPoints.map(p => path.resolve(__dirname, p)),
  }).then(app => app.build())
}

run({
  out: './core/api',
  entryPoints: [
    '../packages/drawerly-core/src/index.ts',
    '../packages/drawerly-core/src/dom/index.ts',
  ],
})
  .then(() => run({
    out: './react/api',
    entryPoints: ['../packages/drawerly-react/src/index.ts'],
  }))
  .then(() => run({
    out: './vue/api',
    entryPoints: ['../packages/drawerly-vue/src/index.ts'],
  }))
