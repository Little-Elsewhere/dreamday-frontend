import type { MetadataRoute } from 'next'

import { serverEnv } from '@/env/server'

const manifest = (): MetadataRoute.Manifest => ({
  name: serverEnv.NEXT_PUBLIC_APP_NAME,
  short_name: serverEnv.NEXT_PUBLIC_APP_NAME,
  description: serverEnv.NEXT_PUBLIC_APP_DESCRIPTION,
  start_url: '/en',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#ffffff',
  theme_color: '#ffffff',
  icons: [
    {
      src: '/globe.svg',
      sizes: '192x192',
      type: 'image/svg+xml',
    },
    {
      src: '/globe.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
    },
  ],
})

export default manifest
