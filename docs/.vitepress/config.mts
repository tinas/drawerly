import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Drawerly',
  description: 'A lightweight, stack-driven way to manage drawers',

  appearance: 'dark',
  cleanUrls: true,

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  },

  themeConfig: {
    logo: '/logo.svg',

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Ahmet Tınastepe',
    },

    socialLinks: [
      { icon: 'x', link: 'https://x.com/tinasdev' },
      { icon: 'github', link: 'https://github.com/tinas/drawerly' },
    ],
  },

  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'author', content: 'Ahmet Tınastepe' }],
    ['meta', { property: 'og:title', content: 'Drawerly' }],
    ['meta', { property: 'og:description', content: 'A lightweight, stack-driven way to manage drawers' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }],
  ],
})
