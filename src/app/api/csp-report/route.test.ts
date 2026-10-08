import { afterEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

afterEach(() => vi.restoreAllMocks())

describe('CSP report endpoint', () => {
  it('logs the blocked origin without logging URL paths or query tokens', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const request = new Request('https://dreamday.example/api/csp-report', {
      method: 'POST',
      body: JSON.stringify({
        'csp-report': {
          'blocked-uri': 'https://cdn.example/private?token=secret',
          'document-uri': 'https://dreamday.example/en/auth/confirm?token_hash=secret',
          'effective-directive': 'img-src',
        },
      }),
    })

    expect((await POST(request)).status).toBe(204)
    expect(warning).toHaveBeenCalledWith('CSP violation', {
      blockedOrigin: 'https://cdn.example',
      effectiveDirective: 'img-src',
      violatedDirective: undefined,
    })
  })

  it('rejects report bodies that exceed the size limit before parsing', async () => {
    const request = new Request('https://dreamday.example/api/csp-report', {
      method: 'POST',
      body: JSON.stringify({ oversized: 'x'.repeat(16 * 1024) }),
    })

    expect((await POST(request)).status).toBe(413)
  })
})
