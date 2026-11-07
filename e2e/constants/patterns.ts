export const EMAIL_TOKEN_QUERY = /[?&]token=([^&\s"']+)/

export const IMAGE_CONTENT_TYPE = /image\//

const pathOf = (url: URL | string) =>
  typeof url === 'string' ? new URL(url).pathname : url.pathname

export const isLocaleLoginUrl = (locale: string) => (url: URL) =>
  pathOf(url) === `/${locale}/auth/login`

export const isLocaleAuthLoginPath = (locale: string) => (url: URL) =>
  pathOf(url) === `/${locale}/auth/login` || pathOf(url).startsWith(`/${locale}/auth/login?`)

export const isLocaleAuthRegisterPath = (locale: string) => (url: URL) =>
  pathOf(url) === `/${locale}/auth/register`

export const isLocaleAuthRegisterSuccessPath = (locale: string) => (url: URL) =>
  pathOf(url) === `/${locale}/auth/register/success`

export const isLocalePostAuthLanding = (locale: string) => (url: URL) => {
  const path = pathOf(url)
  return (
    path === `/${locale}/trips` ||
    path.startsWith(`/${locale}/trips/`) ||
    path === `/${locale}/account`
  )
}

export const isLocaleTripsPath = (locale: string) => (url: URL) =>
  pathOf(url) === `/${locale}/trips`

export const isLocaleTripsIndex = (locale: string) => (url: URL) => {
  const path = pathOf(url)
  return path === `/${locale}/trips` || path.startsWith(`/${locale}/trips/`)
}

export const isLocaleTripsCreatePath = (locale: string) => (url: URL) =>
  pathOf(url) === `/${locale}/trips/create`

export const isLocaleTripDetailPath = (locale: string, tripId: string) => (url: URL) =>
  pathOf(url) === `/${locale}/trips/${tripId}`

export const isLocaleTripEditPath = (locale: string, tripId: string) => (url: URL) =>
  pathOf(url) === `/${locale}/trips/${tripId}/edit`

export const isLocalePublishedTripPath = (locale: string) => (url: URL) => {
  const path = pathOf(url)
  const prefix = `/${locale}/trips/`
  if (!path.startsWith(prefix)) return false
  const id = path.slice(prefix.length)
  return id.length === 36 && !id.includes('/')
}
