/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache, PAGES_CACHE_NAME } from '@serwist/turbopack/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { NetworkOnly, Serwist } from 'serwist'

import { DEFAULT_LOCALE } from '@/constants/locale'
import { isPrivateRoute } from '@/features/auth/utils/route'
import { getPathnameLocale } from '@/utils/locale'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ sameOrigin, url }) =>
        sameOrigin &&
        (/^\/(?:[a-z]{2}\/)?auth(?:\/|$)/.test(url.pathname) || isPrivateRoute(url.pathname)),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
})

const purgeCachedPrivatePages = async (): Promise<void> => {
  const existingCacheNames = new Set(await caches.keys())

  await Promise.all(
    Object.values(PAGES_CACHE_NAME)
      .filter((cacheName) => existingCacheNames.has(cacheName))
      .map(async (cacheName) => {
        const cache = await caches.open(cacheName)
        const cachedRequests = await cache.keys()
        const privateRequests = cachedRequests.filter((request) =>
          isPrivateRoute(new URL(request.url).pathname),
        )

        await Promise.all(privateRequests.map((request) => cache.delete(request)))
      }),
  )
}

serwist.setCatchHandler(async ({ request, url }) => {
  if (request.destination === 'document') {
    const locale = getPathnameLocale(url.pathname) ?? DEFAULT_LOCALE
    const offlineUrl = `/${locale}/~offline`
    const offlineResponse = await serwist.matchPrecache(offlineUrl)
    if (offlineResponse) return offlineResponse
  }
  return Response.error()
})

self.addEventListener('activate', (event): void => {
  event.waitUntil(purgeCachedPrivatePages())
})

serwist.addEventListeners()
