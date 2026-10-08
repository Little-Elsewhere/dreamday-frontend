import { z } from 'zod'

const cspReportSchema = z.object({
  'blocked-uri': z.string().max(2048).optional(),
  disposition: z.enum(['enforce', 'report']).optional(),
  'document-uri': z.string().max(2048).optional(),
  'effective-directive': z.string().max(128).optional(),
  referrer: z.string().max(2048).optional(),
  'violated-directive': z.string().max(256).optional(),
})

const reportSchema = z.object({
  'csp-report': cspReportSchema,
})

const MAX_REPORT_BODY_BYTES = 16 * 1024

type RequestBodyResult = { success: true; data: unknown } | { success: false; status: 400 | 413 }

const readJsonBody = async (request: Request): Promise<RequestBodyResult> => {
  if (!request.body) return { success: false, status: 400 }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let byteLength = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      byteLength += value.byteLength
      if (byteLength > MAX_REPORT_BODY_BYTES) {
        await reader.cancel()
        return { success: false, status: 413 }
      }

      chunks.push(value)
    }
  } catch {
    return { success: false, status: 400 }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(byteLength)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    const data: unknown = JSON.parse(new TextDecoder().decode(body))
    return { success: true, data }
  } catch {
    return { success: false, status: 400 }
  }
}

const getBlockedOrigin = (value: string | undefined): string | undefined => {
  if (!value) return undefined

  try {
    const url = new URL(value)
    return url.origin === 'null' ? url.protocol : url.origin
  } catch {
    return undefined
  }
}

export const POST = async (request: Request) => {
  const body = await readJsonBody(request)
  if (!body.success) return new Response(null, { status: body.status })

  const result = reportSchema.safeParse(body.data)

  if (!result.success) {
    return new Response(null, { status: 400 })
  }

  const report = result.data['csp-report']

  console.warn('CSP violation', {
    blockedOrigin: getBlockedOrigin(report['blocked-uri']),
    effectiveDirective: report['effective-directive'],
    violatedDirective: report['violated-directive'],
  })

  return new Response(null, { status: 204 })
}
