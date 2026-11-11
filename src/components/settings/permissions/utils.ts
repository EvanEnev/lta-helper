import {DateTime} from 'luxon'

const ZONE = 'Europe/Moscow'

export const dateKey = (value?: string | null) =>
  value ? value.slice(0, 10) : null

export const todayKey = () => DateTime.now().setZone(ZONE).toISODate()!

export const dateInDays = (days: number) =>
  DateTime.now().setZone(ZONE).plus({days}).toISODate()!

export const isExpired = (expires?: string | null) => {
  const key = dateKey(expires)

  return !!key && key <= todayKey()
}

export const formatExpires = (expires: string) =>
  DateTime.fromISO(dateKey(expires)!).setLocale('ru').toFormat('dd.MM.yyyy')
