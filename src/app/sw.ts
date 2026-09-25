/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { NetworkOnly, Serwist } from 'serwist'

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
        sameOrigin && /^\/(?:[a-z]{2}\/)?auth(?:\/|$)/.test(url.pathname),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
})

serwist.setCatchHandler(async ({ request, url }) => {
  if (request.destination === 'document') {
    const offlineUrl = url.pathname.startsWith('/vi') ? '/vi/~offline' : '/en/~offline'
    const offlineResponse = await serwist.matchPrecache(offlineUrl)
    if (offlineResponse) return offlineResponse
  }
  return Response.error()
})

serwist.addEventListeners()
