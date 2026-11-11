import type {MetadataRoute} from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'LTA Helper',
    short_name: 'LTA Helper',
    description: 'Помощник в LT Арене',
    lang: 'ru',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {name: 'График работы', url: '/schedule'},
      {name: 'График ЗП', url: '/salary'},
      {name: 'Проставление ЗП', url: '/admin'},
    ],
  }
}
