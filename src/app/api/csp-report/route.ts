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

export const POST = async (request: Request) => {
  const payload = await request.json().catch(() => null)
  const result = reportSchema.safeParse(payload)

  if (!result.success) {
    return new Response(null, { status: 400 })
  }

  const report = result.data['csp-report']

  console.warn('CSP violation', {
    blockedUri: report['blocked-uri'],
    documentUri: report['document-uri'],
    effectiveDirective: report['effective-directive'],
    violatedDirective: report['violated-directive'],
  })

  return new Response(null, { status: 204 })
}
