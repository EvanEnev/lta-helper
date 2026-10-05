import {DateTime} from 'luxon'
import convertTZ from '@/lib/functions/convertTZ'
import type {Day} from '@/src/utils/types'

const ZONE = 'Europe/Moscow'

export interface Shift {
  date: DateTime
  locationName: string
  time?: string
  role?: string
  daysLeft: number
}

export function getShifts(workingDays: Day[]) {
  const today = convertTZ(new Date(), ZONE).startOf('day')

  const shifts = workingDays
    .flatMap(day => {
      const self = day.locationData?.find(data => data.self)
      if (!self || !day.date) return []

      const date = (
        DateTime.isDateTime(day.date)
          ? day.date
          : DateTime.fromISO(String(day.date), {zone: ZONE})
      ).startOf('day')

      return [
        {
          date,
          locationName: self.locationName,
          time: self.data?.time,
          role: self.data?.role,
          daysLeft: Math.round(date.diff(today, 'days').days),
        } satisfies Shift,
      ]
    })
    .sort((a, b) => a.date.toMillis() - b.date.toMillis())

  const thisMonth = shifts.filter(shift => shift.date.hasSame(today, 'month'))

  return {
    upcoming: shifts.filter(shift => shift.daysLeft >= 0),
    worked: thisMonth.filter(shift => shift.daysLeft < 0).length,
    left: thisMonth.filter(shift => shift.daysLeft >= 0).length,
  }
}
