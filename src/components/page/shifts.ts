import {DateTime} from 'luxon'
import convertTZ from '@/lib/functions/convertTZ'

const ZONE = 'Europe/Moscow'

export interface Shift {
  date: DateTime
  locationName: string
  time?: string
  role?: string
  daysLeft: number
}

export function getShifts(shifts: Shift[]) {
  const thisMonth = shifts.filter(shift =>
    shift.date.hasSame(convertTZ(new Date(), ZONE), 'month'),
  )

  return {
    upcoming: shifts.filter(shift => shift.daysLeft >= 0),
    worked: thisMonth.filter(shift => shift.daysLeft < 0).length,
    left: thisMonth.filter(shift => shift.daysLeft >= 0).length,
  }
}
