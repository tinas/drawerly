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
  { text: 'React', link: '/react/introduction', activeMatch: '^/react/' },
  { text: 'Core', link: '/core/introduction', activeMatch: '^/core/' },
]

const VUE_PACKAGE_GUIDE = [
  { text: 'Introduction', link: '/vue/introduction' },
  { text: 'Getting Started', link: '/vue/getting-started' },
  { text: 'Styling', link: '/vue/styling' },
  { text: 'Unstyled Mode', link: '/vue/unstyled-mode' },
]

const VUE_PACKAGE_COMPOSABLES = [
  { text: 'useDrawerly', link: '/vue/composables/use-drawerly' },
  { text: 'useDrawer', link: '/vue/composables/use-drawer' },
]

const VUE_PACKAGE_API = [
  { text: 'createDrawerly', link: '/vue/api/create-drawerly' },
  { text: 'DrawerlyContainer', link: '/vue/api/drawer-container' },
  { text: 'useDrawerly', link: '/vue/api/use-drawerly' },
  { text: 'useDrawer', link: '/vue/api/use-drawer' },
]

const REACT_PACKAGE_GUIDE = [
  { text: 'Introduction', link: '/react/introduction' },
  { text: 'Getting Started', link: '/react/getting-started' },
  { text: 'Styling', link: '/react/styling' },
  { text: 'Unstyled Mode', link: '/react/unstyled-mode' },
]

const REACT_PACKAGE_HOOKS = [
  { text: 'useDrawerly', link: '/react/hooks/use-drawerly' },
  { text: 'useDrawer', link: '/react/hooks/use-drawer' },
]

const REACT_PACKAGE_API = [
  { text: 'createDrawerly', link: '/react/api/create-drawerly' },
  { text: 'DrawerlyContainer', link: '/react/api/drawer-container' },
  { text: 'useDrawerly', link: '/react/api/use-drawerly' },
  { text: 'useDrawer', link: '/react/api/use-drawer' },
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
        activeMatch: '^/(vue|react|core)/',
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
      '/react/': [
        {
          text: 'React Package',
          items: REACT_PACKAGE_GUIDE,
        },
        {
          text: 'Hooks',
          items: REACT_PACKAGE_HOOKS,
        },
        {
          text: 'API',
          items: REACT_PACKAGE_API,
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
