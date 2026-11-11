import {DateTime} from 'luxon'

const DATE = /^\d{4}-\d{2}-\d{2}$/

export const isDate = (value: unknown): value is string =>
  typeof value === 'string' &&
  DATE.test(value) &&
  DateTime.fromISO(value).isValid

export const toId = (value: unknown) => {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

export const toNumber = (value: unknown): number | null | undefined => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)

  return Number.isFinite(number) ? number : undefined
}
