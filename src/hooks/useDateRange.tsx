import getDatesInRange from '@/src/utils/getDatesInRange'
import {useMemo} from 'react'
import {Day} from '../utils/types'

interface DateRange {
  today: Date
  lastDate: Date
  days: Day[]
}

const useDateRange = (nextWeek: boolean): DateRange => {
  const today = new Date()
  const lastDate = new Date(today.getFullYear(), today.getMonth() + 1, 14)

  const days = useMemo(() => {
    const days = getDatesInRange(nextWeek ? 'next' : 'current')
    return days.map(date => ({date}))
  }, [nextWeek])

  return {today, lastDate, days}
}

export default useDateRange
