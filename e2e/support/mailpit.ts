import type { Page } from 'playwright/test'

const DEFAULT_MAILPIT_URL = 'http://127.0.0.1:54324'
const POLL_INTERVAL_MS = 500
const EMAIL_TIMEOUT_MS = 25_000

type MailpitSummary = {
  created?: string
  id: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getMailpitUrl = (): URL => {
  const url = new URL(process.env.E2E_MAILPIT_URL ?? DEFAULT_MAILPIT_URL)
  const localHosts = new Set(['127.0.0.1', 'localhost', '::1', 'mailpit.local'])

  if (!localHosts.has(url.hostname)) {
    throw new Error('Playwright email lookup is restricted to local Mailpit.')
  }

  return url
}

const fetchJson = async (url: URL): Promise<unknown> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(5_000) })
  if (!response.ok) throw new Error(`Mailpit returned HTTP ${response.status}.`)
  return response.json() as Promise<unknown>
}

const findLatestMessage = async (
  email: string,
  sentAfter: number,
): Promise<MailpitSummary | null> => {
  const searchUrl = new URL('/api/v1/search', getMailpitUrl())
  searchUrl.searchParams.set('query', `to:${email}`)
  searchUrl.searchParams.set('limit', '10')

  const result = await fetchJson(searchUrl)
  if (!isRecord(result) || !Array.isArray(result.messages)) return null

  const messages = result.messages.flatMap((message): MailpitSummary[] => {
    if (!isRecord(message) || typeof message.ID !== 'string') return []

    const created = typeof message.Created === 'string' ? message.Created : undefined
    if (created && Date.parse(created) < sentAfter) return []

    return [{ id: message.ID, created }]
  })

  return messages[0] ?? null
}

const extractConfirmationUrl = (html: string, text: string): URL | null => {
  const links = [
    ...Array.from(html.matchAll(/href\s*=\s*["']([^"']+)["']/gi), (match) => match[1]),
    ...Array.from(text.matchAll(/https?:\/\/[^\s<>"']+/gi), (match) => match[0]),
  ]

  for (const candidate of links) {
    const decoded = candidate
      .replaceAll('&amp;', '&')
      .replaceAll('&quot;', '"')
      .replaceAll('&#x27;', "'")
      .replaceAll('&#39;', "'")

    try {
      const url = new URL(decoded)
      if (url.pathname.endsWith('/auth/confirm') && url.searchParams.has('token_hash')) return url
    } catch {
      continue
    }
  }

  return null
}

export const confirmEmailFromMailpit = async (
  page: Page,
  email: string,
  sentAfter: number,
  appBaseUrl: string,
): Promise<void> => {
  const deadline = Date.now() + EMAIL_TIMEOUT_MS

  while (Date.now() < deadline) {
    const message = await findLatestMessage(email, sentAfter)
    if (message) {
      const detailUrl = new URL(
        `/api/v1/message/${encodeURIComponent(message.id)}`,
        getMailpitUrl(),
      )
      const details = await fetchJson(detailUrl)

      if (!isRecord(details)) throw new Error('Mailpit returned an invalid email message.')
      const confirmationUrl = extractConfirmationUrl(
        typeof details.HTML === 'string' ? details.HTML : '',
        typeof details.Text === 'string' ? details.Text : '',
      )
      if (!confirmationUrl)
        throw new Error(`No confirmation link was found in the email for ${email}.`)

      const next = confirmationUrl.searchParams.get('next')
      const nextPath = next ? new URL(next).pathname : ''
      const locale = /^\/(en|vi)(?:\/|$)/.exec(nextPath)?.[1] ?? 'en'
      const appUrl = new URL(appBaseUrl)
      confirmationUrl.protocol = appUrl.protocol
      confirmationUrl.host = appUrl.host
      if (!/^\/(en|vi)(?:\/|$)/.test(confirmationUrl.pathname)) {
        confirmationUrl.pathname = `/${locale}${confirmationUrl.pathname}`
      }

      await page.goto(confirmationUrl.href)
      await page.waitForURL((url) => url.pathname === `/${locale}/trips`, {
        timeout: EMAIL_TIMEOUT_MS,
      })
      return
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  throw new Error(
    `No new confirmation email for ${email} arrived in Mailpit within ${EMAIL_TIMEOUT_MS} ms.`,
  )
}
