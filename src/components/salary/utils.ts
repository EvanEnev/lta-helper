import {DateTime} from 'luxon'
import type {SalaryData, UserSalary} from '@/src/utils/types'

export const ZONE = 'Europe/Moscow'

function parseExpression(source: string): number | null {
  const s = source.replace(/\s+/g, '').replace(/,/g, '.')
  let i = 0

  const number = (): number | null => {
    const match = /^\d+(\.\d+)?/.exec(s.slice(i))
    if (!match) return null
    i += match[0].length
    return Number(match[0])
  }

  const factor = (): number | null => {
    if (s[i] === '-') {
      i++
      const value = factor()
      return value === null ? null : -value
    }
    if (s[i] === '+') {
      i++
      return factor()
    }
    if (s[i] === '(') {
      i++
      const value = expression()
      if (s[i] !== ')') return null
      i++
      return value
    }
    return number()
  }

  const term = (): number | null => {
    let value = factor()
    while (value !== null && (s[i] === '*' || s[i] === '/')) {
      const op = s[i++]
      const right = factor()
      if (right === null) return null
      value = op === '*' ? value * right : value / right
    }
    return value
  }

  const expression = (): number | null => {
    let value = term()
    while (value !== null && (s[i] === '+' || s[i] === '-')) {
      const op = s[i++]
      const right = term()
      if (right === null) return null
      value = op === '+' ? value + right : value - right
    }
    return value
  }

  const result = expression()

  return result !== null && i === s.length && Number.isFinite(result)
    ? result
    : null
}

const evalCache = new Map<string, number>()

export function evalExpr(text?: string | null): number {
  const key = (text ?? '').trim()
  if (!key) return 0
  if (/^-?\d+(\.\d+)?$/.test(key)) return Number(key)

  const cached = evalCache.get(key)
  if (cached !== undefined) return cached

  const result = parseExpression(key) ?? 0
  if (evalCache.size > 2000) evalCache.clear()
  evalCache.set(key, result)

  return result
}

export interface PaymentItem {
  name: string
  value: number
  comment: string
}

export type DayData = SalaryData & {payments?: PaymentItem[]}

export interface DaySummary {
  overwork: number
  games: number
  actorGames: number
  bonuses: number
  fines: number
  payments: number
  hasComment: boolean
}

const num = (value: unknown) => Number(value) || 0

export const visiblePayments = (data: DayData) =>
  (data.payments ?? []).filter(
    p => !(!data.location && p.name === 'Самозанятый'),
  )

export function summarizeDay(data: DayData): DaySummary {
  return {
    overwork: num(data.overworkValue),
    games:
      num(data.oneGames?.value) +
      num(data.twoGames?.value) +
      num(data.threeGames?.value),
    actorGames: num(data.actorGames?.value),
    bonuses: evalExpr(data.bonuses),
    fines: evalExpr(data.fines),
    payments: visiblePayments(data).reduce((s, p) => s + num(p.value), 0),
    hasComment: !!data.comment?.trim(),
  }
}

export const monthStart = (date: string) =>
  DateTime.fromFormat(date, 'yyyy-MM-dd').startOf('month')

export const dayKeys = (date: string) => {
  const month = monthStart(date)

  return Array.from({length: month.daysInMonth ?? 0}, (_, i) =>
    month.plus({days: i}).toFormat('dd.MM'),
  )
}

export const todayKey = () => DateTime.now().setZone(ZONE).toFormat('dd.MM')

export function indexByDay(dates: SalaryData[]) {
  const map = new Map<string, DayData>()

  for (const data of dates) {
    const key = data.date?.slice(0, -5)
    if (key && !map.has(key)) map.set(key, data as DayData)
  }

  return map
}

export const hasContent = (data?: DayData) =>
  !!data && (!!data.id || !!data.payments?.length)

export function monthWeeks(date: string) {
  const keys = dayKeys(date)
  const first = monthStart(date)
  const weeks: (string | null)[][] = []
  let current: (string | null)[] = Array(first.weekday - 1).fill(null)

  for (const key of keys) {
    current.push(key)
    if (current.length === 7) {
      weeks.push(current)
      current = []
    }
  }

  if (current.length) {
    while (current.length < 7) current.push(null)
    weeks.push(current)
  }

  return weeks
}

export function replaceDay(
  rows: UserSalary[],
  workerId: number,
  data: SalaryData,
) {
  return rows.map(row =>
    row.worker.id !== workerId
      ? row
      : {...row, dates: row.dates.map(d => (d.id === data.id ? data : d))},
  )
}

export function removeDay(rows: UserSalary[], dataId: number) {
  return rows.map(row =>
    row.dates.some(d => d.id === dataId)
      ? {...row, dates: row.dates.filter(d => d.id !== dataId)}
      : row,
  )
}

export interface SalaryUpdatePayload {
  worker_id: number
  date: string
  value: number | null
  bonuses: string | null
  fines: string | null
  comment: string | null
  created_by: string | null
  start_time: string | null
  end_time: string | null
  overwork_start: string | null
  overwork_end: string | null
  overwork: number | null
  location: {id: number; name: string; color: string}
}

export const editKey = (
  workerId: number,
  isoDate: string,
  locationId: number,
) => `${workerId}:${isoDate.slice(0, 10)}:${locationId}`

const hhmm = (time: string | null | undefined) =>
  time ? time.slice(0, 5) : null

export function applyRemoteUpdate(
  rows: UserSalary[],
  payload: SalaryUpdatePayload,
): {rows: UserSalary[]; found: boolean} {
  const date = DateTime.fromISO(payload.date.slice(0, 10)).toFormat(
    'dd.MM.yyyy',
  )

  const row = rows.find(r => r.worker.id === payload.worker_id)
  const current = row?.dates.find(
    d => d.date === date && d.location?.id === payload.location?.id,
  )

  if (!row || !current) return {rows, found: false}

  const next: SalaryData = {
    ...current,
    value: payload.value ?? current.value,
    bonuses: payload.bonuses,
    fines: payload.fines ?? current.fines,
    comment: payload.comment,
    createdBy: payload.created_by ?? current.createdBy,
    startTime: hhmm(payload.start_time) ?? current.startTime,
    endTime: hhmm(payload.end_time) ?? current.endTime,
    overworkStart: hhmm(payload.overwork_start),
    overworkEnd: hhmm(payload.overwork_end),
    overworkValue: payload.overwork,
    location: {...current.location, ...payload.location},
  }

  return {rows: replaceDay(rows, row.worker.id, next), found: true}
}

export function visibleLocations<T extends {id: number; name: string}>(
  locations: T[],
  worker: {id: number; locationId?: number | null},
  canViewFull: boolean,
) {
  if (canViewFull) return locations

  return locations.filter(l =>
    (worker.id === 42 || worker.id === 12) && l.id === 17
      ? true
      : [worker.locationId, 12].includes(l.id),
  )
}
