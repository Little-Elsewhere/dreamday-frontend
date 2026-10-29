import 'server-only'

import { HTTP_STATUS } from '@/constants/httpStatuses'
import { serverEnv } from '@/env/server'
import { apiErrorDetailSchema, type MessageResponse } from '@/schemas/api'
import type {
  ApiFailure,
  ApiResult,
  ApiSuccess,
  ParseableSchema,
  RequestBaseOptions,
  RequestBodyOptions,
  RequestOptions,
} from '@/types/api'

const parseJson = async (response: Response) => {
  try {
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

const toFailure = (status: number, payload: unknown): ApiFailure => {
  const parsed = apiErrorDetailSchema.safeParse(payload)
  if (parsed.success) {
    return {
      ok: false,
      status,
      code: parsed.data.detail.code,
      message: parsed.data.detail.message,
    }
  }

  return { ok: false, status }
}

const buildUrl = (path: string, prefix?: string) =>
  `${serverEnv.API_BASE_URL}${prefix ?? ''}${path}`

export const request = async <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  options: RequestOptions,
): Promise<ApiResult<TData>> => {
  const headers = new Headers({ Accept: 'application/json' })

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`)
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path, options.prefix), {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: options.cache ?? 'no-store',
    })
  } catch {
    return { ok: false, status: 0 }
  }

  const payload = await parseJson(response)

  if (!response.ok) {
    return toFailure(response.status, payload)
  }

  try {
    return {
      ok: true,
      status: response.status,
      data: schema.parse(payload),
    }
  } catch {
    return { ok: false, status: response.status }
  }
}

export const get = <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  options: RequestBaseOptions = {},
) => request(path, schema, { ...options, method: 'GET' })

export const post = <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  options: RequestBodyOptions = {},
) => request(path, schema, { ...options, method: 'POST' })

export const put = <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  options: RequestBodyOptions = {},
) => request(path, schema, { ...options, method: 'PUT' })

export const patch = <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  options: RequestBodyOptions = {},
) => request(path, schema, { ...options, method: 'PATCH' })

export const del = <TData>(
  path: string,
  schema: ParseableSchema<TData>,
  options: RequestBodyOptions = {},
) => request(path, schema, { ...options, method: 'DELETE' })

export const isMessageCode = (
  result: ApiResult<MessageResponse>,
  code: number,
): result is ApiSuccess<MessageResponse> =>
  result.ok &&
  (result.status === HTTP_STATUS.OK || result.status === HTTP_STATUS.ACCEPTED) &&
  result.data.code === code
