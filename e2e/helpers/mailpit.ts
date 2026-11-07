import { EMAIL_TOKEN_QUERY } from '../constants/patterns'
import { E2E_MAILPIT_URL } from './env'

type MailpitAddress = { Address: string }
type MailpitMessageSummary = {
  ID: string
  Subject: string
  To: MailpitAddress[]
  Created: string
}

type MailpitMessage = MailpitMessageSummary & {
  Text?: string
  HTML?: string
}

const listMessages = async (): Promise<MailpitMessageSummary[]> => {
  const response = await fetch(`${E2E_MAILPIT_URL}/api/v1/messages?limit=50`)
  if (!response.ok) {
    throw new Error(`Mailpit list failed: ${response.status}`)
  }
  const body = (await response.json()) as { messages?: MailpitMessageSummary[] }
  return body.messages ?? []
}

const readMessage = async (id: string): Promise<MailpitMessage> => {
  const response = await fetch(`${E2E_MAILPIT_URL}/api/v1/message/${id}`)
  if (!response.ok) {
    throw new Error(`Mailpit message failed: ${response.status}`)
  }
  return (await response.json()) as MailpitMessage
}

const extractToken = (content: string): string | null => {
  const match = content.match(EMAIL_TOKEN_QUERY)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

export const waitForEmailToken = async ({
  to,
  subjectIncludes,
  timeoutMs = 15_000,
}: {
  to: string
  subjectIncludes: string
  timeoutMs?: number
}): Promise<string> => {
  const deadline = Date.now() + timeoutMs
  const needle = to.toLowerCase()

  while (Date.now() < deadline) {
    const messages = await listMessages()
    const candidate = messages.find(
      (message) =>
        message.Subject.includes(subjectIncludes) &&
        message.To.some((entry) => entry.Address.toLowerCase() === needle),
    )
    if (candidate) {
      const full = await readMessage(candidate.ID)
      const token = extractToken(`${full.Text ?? ''}\n${full.HTML ?? ''}`)
      if (token) return token
    }
    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  throw new Error(`Timed out waiting for Mailpit email to ${to} (${subjectIncludes})`)
}

export const isMailpitReachable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${E2E_MAILPIT_URL}/api/v1/info`, {
      signal: AbortSignal.timeout(2_000),
    })
    return response.ok
  } catch {
    return false
  }
}
