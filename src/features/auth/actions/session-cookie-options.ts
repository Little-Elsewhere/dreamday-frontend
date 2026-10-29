const isProduction = process.env.NODE_ENV === 'production'

export const authCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
})
