import getDatesInRange from '@/src/utils/getDatesInRange'
import {Day} from '../utils/types'

export default function getDateRange(nextWeek: boolean): {
  today: Date
  lastDate: Date
  days: Day[]
} {
  const today = new Date()
  const lastDate = new Date(today.getFullYear(), today.getMonth() + 1, 14)

  const days = getDatesInRange(nextWeek ? 'next' : 'current').map(date => ({
    date,
  }))

  return {today, lastDate, days}
}
