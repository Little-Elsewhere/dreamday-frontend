export enum Locale {
  VI = 'vi',
  EN = 'en',
}

export const LOCALES = [Locale.EN, Locale.VI] as const
export const DEFAULT_LOCALE = Locale.EN
