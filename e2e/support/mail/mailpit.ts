import type { Page } from 'playwright/test'

import { MAILPIT_URL } from '../constants/urls'
import { mailpitMessageResponseSchema, mailpitSearchResponseSchema } from '../schemas/mailpit'

const EMAIL_TIMEOUT_MS = 20_000
const MAILPIT_REQUEST_TIMEOUT_MS = 10_000
const localConfirmationHosts = new Set([
  '127.0.0.1',
  'localhost',
  '::1',
  '[::1]',
  'dreamday.local',
  'supabase.local',
])

const getConfirmationUrl = (html: string): URL | null => {
  const href = html.match(/href\s*=\s*["']([^"']*\/auth\/confirm\?[^"']+)["']/i)?.[1]
  if (!href) return null

  try {
    const url = new URL(href.replaceAll('&amp;', '&'))
    return localConfirmationHosts.has(url.hostname) && url.searchParams.has('token_hash')
      ? url
      : null
  } catch {
    return null
  }
}

const getLocale = (next: string | null, appUrl: URL): 'en' | 'vi' => {
  try {
    const pathname = new URL(next ?? '/', appUrl).pathname
    return /^\/vi(?:\/|$)/.test(pathname) ? 'vi' : 'en'
  } catch {
    return 'en'
  }
}

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

export const confirmEmail = async (page: Page, email: string): Promise<void> => {
  const mailpitUrl = new URL(MAILPIT_URL)
  const appUrl = new URL(page.url())
  const deadline = Date.now() + EMAIL_TIMEOUT_MS

  while (Date.now() < deadline) {
    const searchUrl = new URL('/api/v1/search', mailpitUrl)
    searchUrl.searchParams.set('query', `to:${email}`)
    searchUrl.searchParams.set('limit', '10')

    const searchResponse = await fetch(searchUrl, {
      signal: AbortSignal.timeout(MAILPIT_REQUEST_TIMEOUT_MS),
    })
    if (!searchResponse.ok) throw new Error(`Mailpit returned HTTP ${searchResponse.status}.`)

    const { messages } = mailpitSearchResponseSchema.parse(await searchResponse.json())
    for (const { ID } of messages) {
      const detailUrl = new URL(`/api/v1/message/${encodeURIComponent(ID)}`, mailpitUrl)
      const detailResponse = await fetch(detailUrl, {
        signal: AbortSignal.timeout(MAILPIT_REQUEST_TIMEOUT_MS),
      })
      if (!detailResponse.ok) throw new Error(`Mailpit returned HTTP ${detailResponse.status}.`)

      const { HTML } = mailpitMessageResponseSchema.parse(await detailResponse.json())
      const confirmationUrl = getConfirmationUrl(HTML ?? '')
      if (!confirmationUrl) continue

      const locale = getLocale(confirmationUrl.searchParams.get('next'), appUrl)

      confirmationUrl.protocol = appUrl.protocol
      confirmationUrl.host = appUrl.host
      if (!/^\/(en|vi)(?:\/|$)/.test(confirmationUrl.pathname)) {
        confirmationUrl.pathname = `/${locale}${confirmationUrl.pathname}`
      }

      await page.goto(confirmationUrl.href)
      await page.waitForURL(
        (url) => url.origin === appUrl.origin && url.pathname === `/${locale}/trips`,
        { timeout: EMAIL_TIMEOUT_MS },
      )
      return
    }

    await wait(500)
  }

  throw new Error(
    `No confirmation email for ${email} arrived in Mailpit within ${EMAIL_TIMEOUT_MS} ms.`,
  )
}
