import {DateTime} from 'luxon'
import {
  CircleCheck,
  CircleHelp,
  CircleMinus,
  MapPin,
  type LucideIcon,
} from 'lucide-react'
import type {LocationData} from '@/src/utils/types'

// То, что приходит с сервера (getWorkingDays): дата - ISO-строка
export interface ScheduleDayInput {
  date: string
  value?: string | null
  comment?: string | null
  locationData?: LocationData[]
}

export interface ScheduleDay {
  key: string // yyyy-MM-dd, единственный способ сравнивать дни
  date: DateTime
  value: string
  comment: string
  locationData: LocationData[]
}

export const toScheduleDays = (days: ScheduleDayInput[]): ScheduleDay[] =>
  days.map(day => {
    // setZone: день не должен «съезжать» в часовом поясе браузера
    const date = DateTime.fromISO(day.date, {setZone: true}).startOf('day')

    return {
      key: date.toISODate() ?? day.date,
      date,
      value: day.value ?? '',
      comment: day.comment ?? '',
      locationData: day.locationData ?? [],
    }
  })

// Недели Пн-Вс; пустые слоты в начале и конце заполняются null
export function groupWeeks(days: ScheduleDay[]) {
  const weeks: (ScheduleDay | null)[][] = []
  let current: (ScheduleDay | null)[] = []

  const closeWeek = () => {
    while (current.length < 7) current.push(null)
    weeks.push(current)
    current = []
  }

  for (const day of days) {
    const slot = day.date.weekday - 1

    if (current.length > slot) closeWeek()
    while (current.length < slot) current.push(null)
    current.push(day)
  }

  if (current.length) closeWeek()

  return weeks
}

export type Tone = 'success' | 'warning' | 'destructive' | 'primary'

export interface StatusMeta {
  value: string
  label: string
  short: string
  icon: LucideIcon
  tone: Tone
}

// Классы написаны целиком, чтобы Tailwind их увидел.
// Выбранное состояние - тонированный фон и рамка, а не залитый цвет:
// так текст остаётся читаемым в обеих темах
export const TONE_CLASSES: Record<
  Tone,
  {soft: string; text: string; icon: string; active: string}
> = {
  success: {
    soft: 'bg-success/15 text-success hover:bg-success/25',
    text: 'text-success',
    icon: '[&_svg]:text-success',
    active: 'border-success bg-success/20 hover:bg-success/30',
  },
  warning: {
    soft: 'bg-warning/15 text-warning hover:bg-warning/25',
    text: 'text-warning',
    icon: '[&_svg]:text-warning',
    active: 'border-warning bg-warning/20 hover:bg-warning/30',
  },
  destructive: {
    soft: 'bg-destructive/15 text-destructive hover:bg-destructive/25',
    text: 'text-destructive',
    icon: '[&_svg]:text-destructive',
    active: 'border-destructive bg-destructive/20 hover:bg-destructive/30',
  },
  primary: {
    soft: 'bg-primary/15 text-primary hover:bg-primary/25',
    text: 'text-primary',
    icon: '[&_svg]:text-primary',
    active: 'border-primary bg-primary/20 hover:bg-primary/30',
  },
}

export const STATUSES: StatusMeta[] = [
  {
    value: '+',
    label: 'Могу',
    short: 'Могу',
    icon: CircleCheck,
    tone: 'success',
  },
  {
    value: '-',
    label: 'Не могу',
    short: 'Не могу',
    icon: CircleMinus,
    tone: 'destructive',
  },
  {
    value: '+/-',
    label: 'С ограничением',
    short: 'Огран.',
    icon: CircleHelp,
    tone: 'warning',
  },
]

// Администратор может поставить в value название своей площадки
export const locationStatus = (name: string): StatusMeta => ({
  value: name,
  label: name,
  short: name,
  icon: MapPin,
  tone: 'primary',
})

export function getStatus(
  value: string,
  locationNames: string[],
): StatusMeta | null {
  const status = STATUSES.find(s => s.value === value)
  if (status) return status

  const location = locationNames.find(
    name => name.toLowerCase() === value.toLowerCase(),
  )

  return location ? locationStatus(location) : null
}

// Для «не могу» актёрам причина не нужна, для «с ограничением» нужна всем
export const needsComment = (value: string, rank?: string | null) =>
  value === '+/-' || (value === '-' && !!rank && rank.toLowerCase() !== 'актёр')

export const COMMENT_TEMPLATES = ['Выходной', 'Болезнь', 'Учёба']

// Сводка для шапки: «не заполнено» считаем только для сегодня и будущего
export function summarize(
  days: ScheduleDay[],
  locationNames: string[],
  todayKey: string,
) {
  const result = {can: 0, limited: 0, cannot: 0, empty: 0}

  for (const day of days) {
    const status = getStatus(day.value, locationNames)

    if (!status) {
      if (day.key >= todayKey) result.empty++
    } else if (status.tone === 'warning') {
      result.limited++
    } else if (status.tone === 'destructive') {
      result.cannot++
    } else {
      result.can++
    }
  }

  return result
}
