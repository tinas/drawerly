import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

const META_URL = 'https://drawerly.dev'
const META_TITLE = 'Drawerly'
const META_DESCRIPTION = 'Manage multiple drawers with a unified stack and style it your way'
const META_IMAGE = 'https://drawerly.dev/og.png'

const GUIDES = [
  { text: 'Overview', link: '/guide/overview' },
  { text: 'Demo', link: '/guide/demo' },
]

const PACKAGES = [
  { text: 'Vue', link: '/vue/introduction', activeMatch: '^/vue/' },
  { text: 'Core', link: '/core/introduction', activeMatch: '^/core/' },
]

const VUE_PACKAGE_GUIDE = [
  { text: 'Introduction', link: '/vue/introduction' },
  { text: 'Getting Started', link: '/vue/getting-started' },
  { text: 'Styling', link: '/vue/styling' },
  { text: 'Headless Mode', link: '/vue/headless-mode' },
]

const VUE_PACKAGE_COMPOSABLES = [
  { text: 'useDrawerContext', link: '/vue/composables/use-drawer-context' },
  { text: 'useDrawerInstance', link: '/vue/composables/use-drawer-instance' },
]

const VUE_PACKAGE_API = [
  { text: 'DrawerlyContainer', link: '/vue/api/drawer-container' },
  { text: 'DrawerPlugin', link: '/vue/api/plugin' },
  { text: 'useDrawerContext', link: '/vue/api/use-drawer-context' },
  { text: 'useDrawerInstance', link: '/vue/api/use-drawer-instance' },
]

const CORE_PACKAGE_GUIDE = [
  { text: 'Introduction', link: '/core/introduction' },
  { text: 'Getting Started', link: '/core/getting-started' },
]

const CORE_PACKAGE_CONCEPTS = [
  { text: 'Defining Drawers', link: '/core/concepts/defining-drawers' },
  { text: 'Managing the Stack', link: '/core/concepts/managing-stack' },
  { text: 'Styling', link: '/core/concepts/styling' },
]

const CORE_PACKAGE_API = [
  { text: 'API Reference', link: '/core/api/' },
]

export default defineConfig({
  title: 'Drawerly',
  description: 'A lightweight, stack-driven way to manage drawers',

  lang: 'en-US',
  appearance: 'dark',
  cleanUrls: true,
  ignoreDeadLinks: true,

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin(),
    ],
  },

  themeConfig: {
    logo: '/logo.svg',

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Ahmet Tınastepe',
    },

    socialLinks: [
      { icon: 'x', link: 'https://x.com/tinasdev' },
      { icon: 'github', link: 'https://github.com/tinas/drawerly' },
    ],

    nav: [
      {
        text: 'Guide',
        link: '/guide/overview',
        activeMatch: '^/guide/',
      },
      {
        text: 'Packages',
        items: PACKAGES,
        activeMatch: '^/(vue|core)/',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: GUIDES,
        },
        {
          text: 'Packages',
          items: PACKAGES,
        },
      ],
      '/vue/': [
        {
          text: 'Vue Package',
          items: VUE_PACKAGE_GUIDE,
        },
        {
          text: 'Composables',
          items: VUE_PACKAGE_COMPOSABLES,
        },
        {
          text: 'API',
          items: VUE_PACKAGE_API,
        },
      ],
      '/core/': [
        {
          text: 'Core Package',
          items: CORE_PACKAGE_GUIDE,
        },
        {
          text: 'Concepts',
          items: CORE_PACKAGE_CONCEPTS,
        },
        {
          text: 'API',
          items: CORE_PACKAGE_API,
        },
      ],
    },
  },

  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'author', content: 'Ahmet Tınastepe' }],
    ['meta', { property: 'og:url', content: META_URL }],
    ['meta', { property: 'og:title', content: META_TITLE }],
    ['meta', { property: 'og:description', content: META_DESCRIPTION }],
    ['meta', { property: 'og:image', content: META_IMAGE }],
    ['meta', { property: 'twitter:url', content: META_URL }],
    ['meta', { property: 'twitter:title', content: META_TITLE }],
    ['meta', { property: 'twitter:description', content: META_DESCRIPTION }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:creator', content: '@tinasdev' }],
    ['meta', { name: 'twitter:image', content: META_IMAGE }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }],
  ],
})
