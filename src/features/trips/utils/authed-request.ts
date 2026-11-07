import 'server-only'

import { getAccessToken, refreshSessionTokens } from '@/features/auth/actions/session'
import { AUTH_MESSAGE_CODE } from '@/features/auth/constants/codes'
import type { ApiResult, ParseableSchema } from '@/types/api'
import { del, get, patch, post, postForm } from '@/utils/api-client'

const isAuthFailure = (result: ApiResult<unknown>) =>
  !result.ok &&
  (result.code === AUTH_MESSAGE_CODE.INVALID_OR_EXPIRED_ACCESS_TOKEN ||
    result.code === AUTH_MESSAGE_CODE.BEARER_ACCESS_TOKEN_REQUIRED)

const withAccessToken = async <TData>(
  run: (accessToken: string) => Promise<ApiResult<TData>>,
): Promise<ApiResult<TData>> => {
  let accessToken = await getAccessToken()
  if (!accessToken) {
    const tokens = await refreshSessionTokens()
    accessToken = tokens?.access_token
  }
  if (!accessToken) return { ok: false, status: 401 }

  let result = await run(accessToken)
  if (isAuthFailure(result)) {
    const tokens = await refreshSessionTokens()
    if (!tokens) return result
    result = await run(tokens.access_token)
  }
  return result
}

export const authedGet = <TData>(path: string, schema: ParseableSchema<TData>) =>
  withAccessToken((accessToken) => get(path, schema, { accessToken }))

export const authedPost = <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  body?: Record<string, unknown>,
) => withAccessToken((accessToken) => post(path, schema, { accessToken, body }))

export const authedPatch = <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  body?: Record<string, unknown>,
) => withAccessToken((accessToken) => patch(path, schema, { accessToken, body }))

export const authedDel = <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  body?: Record<string, unknown>,
) => withAccessToken((accessToken) => del(path, schema, { accessToken, body }))

export const authedPostForm = <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  formData: FormData,
) => withAccessToken((accessToken) => postForm(path, schema, { accessToken, formData }))
