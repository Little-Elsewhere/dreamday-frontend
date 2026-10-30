import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API_ROUTES } from '@/constants/api-routes'
import { HTTP_STATUS } from '@/constants/httpStatuses'
import { ROUTES } from '@/constants/routes'
import { AUTH_MESSAGE_CODE } from '@/features/auth/constants/codes'
import { messageResponseSchema, tokenResponseSchema } from '@/features/auth/schemas/api'
import { ActionErrorKind } from '@/types/action-result'

vi.mock('server-only', () => ({}))

const getLocale = vi.fn(async () => 'en')
const redirect = vi.fn(() => {
  throw new Error('NEXT_REDIRECT')
})
const post = vi.fn()
const setSessionTokens = vi.fn(async () => undefined)
const clearSessionTokens = vi.fn(async () => undefined)
const getAccessToken = vi.fn(async () => null as string | null)
const getRefreshToken = vi.fn(async () => null as string | null)
const refreshSessionTokens = vi.fn(async () => null as typeof tokenResponse | null)

vi.mock('next-intl/server', () => ({
  getLocale: () => getLocale(),
}))

vi.mock('@/i18n/navigation', () => ({
  redirect: (...args: unknown[]) => Reflect.apply(redirect, undefined, args),
}))

vi.mock('@/features/auth/actions/session', () => ({
  setSessionTokens: (...args: unknown[]) => Reflect.apply(setSessionTokens, undefined, args),
  clearSessionTokens: (...args: unknown[]) => Reflect.apply(clearSessionTokens, undefined, args),
  getAccessToken: () => getAccessToken(),
  getRefreshToken: () => getRefreshToken(),
  refreshSessionTokens: () => refreshSessionTokens(),
}))

vi.mock('@/utils/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/utils/api-client')>('@/utils/api-client')
  return {
    ...actual,
    post: (...args: unknown[]) => Reflect.apply(post, undefined, args),
  }
})

const {
  forgotPassword,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  updatePassword,
} = await import('@/features/auth/actions/auth')

const tokenResponse = {
  access_token: 'access-token',
  token_type: 'bearer' as const,
  expires_in: 900,
  refresh_token: 'refresh-token',
  refresh_expires_in: 604_800,
}

const validRegistration = {
  email: 'user@example.com',
  password: 'password-12345',
  confirmPassword: 'password-12345',
}

const validLogin = {
  email: 'user@example.com',
  password: 'password-12345',
}

const validUpdate = {
  currentPassword: 'old-password1',
  password: 'password-12345',
  confirmPassword: 'password-12345',
}

const validReset = {
  password: 'password-12345',
  confirmPassword: 'password-12345',
}

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getLocale.mockResolvedValue('en')
    redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    getAccessToken.mockResolvedValue(null)
    getRefreshToken.mockResolvedValue(null)
    refreshSessionTokens.mockResolvedValue(null)
  })

  describe('register', () => {
    it('rejects invalid form input without calling the API', async () => {
      await expect(
        register({
          email: 'bad',
          password: 'short',
          confirmPassword: 'short',
        }),
      ).resolves.toEqual({
        success: false,
        error: { kind: ActionErrorKind.Message, key: 'auth.common.errors.system' },
      })
      expect(post).not.toHaveBeenCalled()
    })

    it('registers and redirects to the check-email page', async () => {
      post.mockResolvedValue({
        ok: true,
        status: HTTP_STATUS.ACCEPTED,
        data: { code: AUTH_MESSAGE_CODE.REGISTRATION_ACCEPTED, message: 'ok' },
      })

      await expect(register(validRegistration)).rejects.toThrow('NEXT_REDIRECT')

      expect(post).toHaveBeenCalledWith(API_ROUTES.AUTH.REGISTER, messageResponseSchema, {
        body: { email: 'user@example.com', password: 'password-12345' },
      })
      expect(redirect).toHaveBeenCalledWith({
        href: `${ROUTES.PUBLIC.AUTH.REGISTER_SUCCESS}?email=user%40example.com`,
        locale: 'en',
      })
    })

    it('maps an already-registered email to a form message', async () => {
      post.mockResolvedValue({
        ok: false,
        status: HTTP_STATUS.CONFLICT,
        code: AUTH_MESSAGE_CODE.EMAIL_ALREADY_REGISTERED,
        message: 'taken',
      })

      await expect(register(validRegistration)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.register.errors.emailAlreadyRegistered',
        },
      })
    })

    it('falls back to the system error for unexpected API failures', async () => {
      post.mockResolvedValue({ ok: false, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })

      await expect(register(validRegistration)).resolves.toEqual({
        success: false,
        error: { kind: ActionErrorKind.Message, key: 'auth.common.errors.system' },
      })
    })
  })

  describe('resendVerification', () => {
    it('rejects a blank email without calling the API', async () => {
      await expect(resendVerification('   ')).resolves.toEqual({
        success: false,
        error: { kind: ActionErrorKind.Message, key: 'auth.common.errors.system' },
      })
      expect(post).not.toHaveBeenCalled()
    })

    it('normalizes the email and returns success when accepted', async () => {
      post.mockResolvedValue({
        ok: true,
        status: HTTP_STATUS.ACCEPTED,
        data: { code: AUTH_MESSAGE_CODE.VERIFICATION_RESEND_ACCEPTED, message: 'ok' },
      })

      await expect(resendVerification('  User@Example.com ')).resolves.toEqual({
        success: true,
        data: { resent: true },
      })
      expect(post).toHaveBeenCalledWith(
        API_ROUTES.AUTH.RESEND_VERIFICATION,
        messageResponseSchema,
        { body: { email: 'user@example.com' } },
      )
    })

    it('returns a system error when the API rejects the resend', async () => {
      post.mockResolvedValue({ ok: false, status: 0 })

      await expect(resendVerification('user@example.com')).resolves.toEqual({
        success: false,
        error: { kind: ActionErrorKind.Message, key: 'auth.common.errors.system' },
      })
    })
  })

  describe('login', () => {
    it('rejects invalid form input without calling the API', async () => {
      await expect(login({ email: 'bad', password: '' })).resolves.toEqual({
        success: false,
        error: { kind: ActionErrorKind.Message, key: 'auth.common.errors.system' },
      })
      expect(post).not.toHaveBeenCalled()
    })

    it('stores tokens and redirects on successful login', async () => {
      post.mockResolvedValue({
        ok: true,
        status: HTTP_STATUS.OK,
        data: tokenResponse,
      })

      await expect(login(validLogin)).rejects.toThrow('NEXT_REDIRECT')

      expect(post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGIN, tokenResponseSchema, {
        body: validLogin,
      })
      expect(setSessionTokens).toHaveBeenCalledWith(tokenResponse)
      expect(redirect).toHaveBeenCalledWith({
        href: ROUTES.PRIVATE.ACCOUNT,
        locale: 'en',
      })
    })

    it('returns a sign-in failure for invalid credentials', async () => {
      post.mockResolvedValue({
        ok: false,
        status: HTTP_STATUS.UNAUTHORIZED,
        code: AUTH_MESSAGE_CODE.INVALID_CREDENTIALS,
        message: 'invalid',
      })

      await expect(login(validLogin)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.login.errors.signInFailed',
        },
      })
      expect(setSessionTokens).not.toHaveBeenCalled()
    })

    it('resends verification and redirects when the email is unverified', async () => {
      post
        .mockResolvedValueOnce({
          ok: false,
          status: HTTP_STATUS.FORBIDDEN,
          code: AUTH_MESSAGE_CODE.EMAIL_NOT_VERIFIED,
          message: 'unverified',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: HTTP_STATUS.ACCEPTED,
          data: { code: AUTH_MESSAGE_CODE.VERIFICATION_RESEND_ACCEPTED, message: 'ok' },
        })

      await expect(login(validLogin)).rejects.toThrow('NEXT_REDIRECT')

      expect(post).toHaveBeenNthCalledWith(
        2,
        API_ROUTES.AUTH.RESEND_VERIFICATION,
        messageResponseSchema,
        { body: { email: 'user@example.com' } },
      )
      expect(redirect).toHaveBeenCalledWith({
        href: `${ROUTES.PUBLIC.AUTH.REGISTER_SUCCESS}?email=user%40example.com`,
        locale: 'en',
      })
      expect(setSessionTokens).not.toHaveBeenCalled()
    })

    it('returns an account-disabled message', async () => {
      post.mockResolvedValue({
        ok: false,
        status: HTTP_STATUS.FORBIDDEN,
        code: AUTH_MESSAGE_CODE.ACCOUNT_DISABLED,
        message: 'disabled',
      })

      await expect(login(validLogin)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.login.errors.accountDisabled',
        },
      })
    })

    it('falls back to the system error for unexpected login failures', async () => {
      post.mockResolvedValue({ ok: false, status: 500 })

      await expect(login(validLogin)).resolves.toEqual({
        success: false,
        error: { kind: ActionErrorKind.Message, key: 'auth.common.errors.system' },
      })
    })
  })

  describe('forgotPassword', () => {
    it('rejects invalid form input without calling the API', async () => {
      await expect(forgotPassword({ email: 'bad' })).resolves.toEqual({
        success: false,
        error: { kind: ActionErrorKind.Message, key: 'auth.common.errors.system' },
      })
      expect(post).not.toHaveBeenCalled()
    })

    it('redirects after accepting a forgot-password request', async () => {
      post.mockResolvedValue({
        ok: true,
        status: HTTP_STATUS.ACCEPTED,
        data: { code: AUTH_MESSAGE_CODE.PASSWORD_RESET_EMAIL_ACCEPTED, message: 'ok' },
      })

      await expect(forgotPassword({ email: 'user@example.com' })).rejects.toThrow('NEXT_REDIRECT')
      expect(post).toHaveBeenCalledWith(API_ROUTES.AUTH.FORGOT_PASSWORD, messageResponseSchema, {
        body: { email: 'user@example.com' },
      })
      expect(redirect).toHaveBeenCalledWith({
        href: ROUTES.PUBLIC.AUTH.RECOVERY_SUCCESS,
        locale: 'en',
      })
    })

    it('returns a recovery failure when the API does not accept the request', async () => {
      post.mockResolvedValue({ ok: false, status: 0 })

      await expect(forgotPassword({ email: 'user@example.com' })).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.recovery.errors.resetFailed',
        },
      })
    })
  })

  describe('resetPassword', () => {
    it('rejects an empty reset token before calling the API', async () => {
      await expect(resetPassword('', validReset)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.resetPassword.errors.invalidLink',
        },
      })
      expect(post).not.toHaveBeenCalled()
    })

    it('rejects invalid form input without calling the API', async () => {
      await expect(
        resetPassword('reset-token', {
          password: 'short',
          confirmPassword: 'short',
        }),
      ).resolves.toEqual({
        success: false,
        error: { kind: ActionErrorKind.Message, key: 'auth.common.errors.system' },
      })
      expect(post).not.toHaveBeenCalled()
    })

    it('clears the session and redirects after a successful password reset', async () => {
      post.mockResolvedValue({
        ok: true,
        status: HTTP_STATUS.OK,
        data: { code: AUTH_MESSAGE_CODE.PASSWORD_RESET_SUCCESS, message: 'ok' },
      })

      await expect(resetPassword('reset-token', validReset)).rejects.toThrow('NEXT_REDIRECT')

      expect(post).toHaveBeenCalledWith(API_ROUTES.AUTH.RESET_PASSWORD, messageResponseSchema, {
        body: { token: 'reset-token', password: 'password-12345' },
      })
      expect(clearSessionTokens).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith({
        href: ROUTES.PUBLIC.AUTH.LOGIN,
        locale: 'en',
      })
    })

    it('maps an expired or invalid reset link', async () => {
      post.mockResolvedValue({
        ok: false,
        status: HTTP_STATUS.BAD_REQUEST,
        code: AUTH_MESSAGE_CODE.INVALID_OR_EXPIRED_PASSWORD_RESET_LINK,
        message: 'expired',
      })

      await expect(resetPassword('reset-token', validReset)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.resetPassword.errors.invalidLink',
        },
      })
      expect(clearSessionTokens).not.toHaveBeenCalled()
    })

    it('returns a generic reset failure for unexpected API errors', async () => {
      post.mockResolvedValue({ ok: false, status: 500 })

      await expect(resetPassword('reset-token', validReset)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.resetPassword.errors.resetFailed',
        },
      })
    })
  })

  describe('updatePassword', () => {
    it('rejects invalid form input without calling the API', async () => {
      await expect(
        updatePassword({
          currentPassword: '',
          password: 'short',
          confirmPassword: 'short',
        }),
      ).resolves.toEqual({
        success: false,
        error: { kind: ActionErrorKind.Message, key: 'auth.common.errors.system' },
      })
      expect(post).not.toHaveBeenCalled()
      expect(refreshSessionTokens).not.toHaveBeenCalled()
    })

    it('returns session expired when no access token can be recovered', async () => {
      getAccessToken.mockResolvedValue(null)
      refreshSessionTokens.mockResolvedValue(null)

      await expect(updatePassword(validUpdate)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.updatePassword.errors.sessionExpired',
        },
      })
      expect(post).not.toHaveBeenCalled()
    })

    it('refreshes once when the access cookie is missing, then updates', async () => {
      getAccessToken.mockResolvedValue(null)
      refreshSessionTokens.mockResolvedValue(tokenResponse)
      post.mockResolvedValue({
        ok: true,
        status: HTTP_STATUS.OK,
        data: tokenResponse,
      })

      await expect(updatePassword(validUpdate)).resolves.toEqual({
        success: true,
        data: { updated: true },
      })

      expect(refreshSessionTokens).toHaveBeenCalledTimes(1)
      expect(post).toHaveBeenCalledWith(API_ROUTES.AUTH.UPDATE_PASSWORD, tokenResponseSchema, {
        accessToken: 'access-token',
        body: {
          current_password: 'old-password1',
          new_password: 'password-12345',
        },
      })
      expect(setSessionTokens).toHaveBeenCalledWith(tokenResponse)
    })

    it('retries after an expired access token when refresh succeeds', async () => {
      getAccessToken.mockResolvedValue('stale-access')
      post
        .mockResolvedValueOnce({
          ok: false,
          status: HTTP_STATUS.UNAUTHORIZED,
          code: AUTH_MESSAGE_CODE.INVALID_OR_EXPIRED_ACCESS_TOKEN,
          message: 'expired',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: HTTP_STATUS.OK,
          data: tokenResponse,
        })
      refreshSessionTokens.mockResolvedValue({
        ...tokenResponse,
        access_token: 'fresh-access',
      })

      await expect(updatePassword(validUpdate)).resolves.toEqual({
        success: true,
        data: { updated: true },
      })

      expect(post).toHaveBeenNthCalledWith(
        2,
        API_ROUTES.AUTH.UPDATE_PASSWORD,
        tokenResponseSchema,
        {
          accessToken: 'fresh-access',
          body: {
            current_password: 'old-password1',
            new_password: 'password-12345',
          },
        },
      )
    })

    it('returns session expired when refresh fails after an expired access token', async () => {
      getAccessToken.mockResolvedValue('stale-access')
      post.mockResolvedValue({
        ok: false,
        status: HTTP_STATUS.UNAUTHORIZED,
        code: AUTH_MESSAGE_CODE.BEARER_ACCESS_TOKEN_REQUIRED,
        message: 'missing',
      })
      refreshSessionTokens.mockResolvedValue(null)

      await expect(updatePassword(validUpdate)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.updatePassword.errors.sessionExpired',
        },
      })
      expect(post).toHaveBeenCalledTimes(1)
    })

    it('maps an incorrect current password to a field error', async () => {
      getAccessToken.mockResolvedValue('access-token')
      post.mockResolvedValue({
        ok: false,
        status: HTTP_STATUS.BAD_REQUEST,
        code: AUTH_MESSAGE_CODE.INVALID_CURRENT_PASSWORD,
        message: 'wrong',
      })

      await expect(updatePassword(validUpdate)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Field,
          field: 'currentPassword',
          key: 'auth.updatePassword.errors.currentPasswordIncorrect',
        },
      })
    })

    it('clears the session when the retried update still reports an expired access token', async () => {
      getAccessToken.mockResolvedValue('stale-access')
      refreshSessionTokens.mockResolvedValue(tokenResponse)
      post
        .mockResolvedValueOnce({
          ok: false,
          status: HTTP_STATUS.UNAUTHORIZED,
          code: AUTH_MESSAGE_CODE.INVALID_OR_EXPIRED_ACCESS_TOKEN,
          message: 'expired',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: HTTP_STATUS.UNAUTHORIZED,
          code: AUTH_MESSAGE_CODE.INVALID_OR_EXPIRED_ACCESS_TOKEN,
          message: 'expired-again',
        })

      await expect(updatePassword(validUpdate)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.updatePassword.errors.sessionExpired',
        },
      })
      expect(clearSessionTokens).toHaveBeenCalled()
    })

    it('returns a generic update failure for unexpected API errors', async () => {
      getAccessToken.mockResolvedValue('access-token')
      post.mockResolvedValue({ ok: false, status: 500 })

      await expect(updatePassword(validUpdate)).resolves.toEqual({
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.updatePassword.errors.updateFailed',
        },
      })
    })
  })

  describe('logout', () => {
    it('posts logout when a refresh token exists, then clears cookies and redirects', async () => {
      getRefreshToken.mockResolvedValue('refresh-token')
      post.mockResolvedValue({
        ok: true,
        status: HTTP_STATUS.OK,
        data: { code: AUTH_MESSAGE_CODE.LOGGED_OUT, message: 'ok' },
      })

      await expect(logout()).rejects.toThrow('NEXT_REDIRECT')
      expect(post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGOUT, messageResponseSchema, {
        body: { refresh_token: 'refresh-token' },
      })
      expect(clearSessionTokens).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith({
        href: ROUTES.PUBLIC.AUTH.LOGIN,
        locale: 'en',
      })
    })

    it('still clears cookies and redirects when no refresh token is stored', async () => {
      getRefreshToken.mockResolvedValue(null)

      await expect(logout()).rejects.toThrow('NEXT_REDIRECT')
      expect(post).not.toHaveBeenCalled()
      expect(clearSessionTokens).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith({
        href: ROUTES.PUBLIC.AUTH.LOGIN,
        locale: 'en',
      })
    })

    it('clears cookies and redirects even if the logout API call fails', async () => {
      getRefreshToken.mockResolvedValue('refresh-token')
      post.mockResolvedValue({ ok: false, status: 0 })

      await expect(logout()).rejects.toThrow('NEXT_REDIRECT')
      expect(clearSessionTokens).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith({
        href: ROUTES.PUBLIC.AUTH.LOGIN,
        locale: 'en',
      })
    })
  })
})
