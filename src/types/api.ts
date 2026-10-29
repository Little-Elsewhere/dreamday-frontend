export type ApiSuccess<TData> = {
  ok: true
  status: number
  data: TData
}

export type ApiFailure = {
  ok: false
  status: number
  code?: number
  message?: string
}

export type ApiResult<TData> = ApiSuccess<TData> | ApiFailure

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type JsonBody = Record<string, unknown>

export type RequestBaseOptions = {
  accessToken?: string
  cache?: RequestCache
  prefix?: string
}

export type RequestBodyOptions = RequestBaseOptions & {
  body?: JsonBody
}

export type RequestOptions = RequestBodyOptions & {
  method: HttpMethod
}

export type ParseableSchema<TData> = {
  parse: (data: unknown) => TData
}
