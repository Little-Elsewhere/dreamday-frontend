import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { withSerwist } from '@serwist/turbopack'

const withNextIntl = createNextIntlPlugin()
const isDevelopment = process.env.DOPPLER_ENVIRONMENT === 'dev'
const isProduction = process.env.DOPPLER_ENVIRONMENT === 'prod'
const supabaseConnectionSources = (() => {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!value) {
    return []
  }

  const url = new URL(value)
  const webSocketProtocol =
    url.protocol === 'https:' ? 'wss:' : url.protocol === 'http:' ? 'ws:' : null

  return [url.origin, ...(webSocketProtocol ? [`${webSocketProtocol}//${url.host}`] : [])]
})()
const connectSources = ["'self'", ...supabaseConnectionSources, 'https://*.posthog.com'].join(' ')

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' https://*.posthog.com 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src ${connectSources}`,
  "media-src 'self'",
  "worker-src 'self' blob: data:",
  "manifest-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ')

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "script-src 'self' https://*.posthog.com",
  "style-src 'self'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src ${connectSources}`,
  "media-src 'self'",
  "worker-src 'self' blob: data:",
  "manifest-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'report-uri /api/csp-report',
].join('; ')

const securityHeaders = [
  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Content-Security-Policy-Report-Only',
          value: contentSecurityPolicyReportOnly,
        },
      ]
    : []),
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  ...(isDevelopment ? { allowedDevOrigins: ['dreamday.local'] } : {}),
  experimental: {
    turbopackRustReactCompiler: true,
    turbopackLocalPostcssConfig: true,
    useOffline: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
    browserToTerminal: true,
  },
  crossOrigin: 'anonymous',
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSerwist(withNextIntl(nextConfig))
