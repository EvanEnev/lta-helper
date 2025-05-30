import {Divider} from '@heroui/react'
import DayButton from './DayButton'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import {Day} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {useAtomValue} from 'jotai'
import {selectedDayAtom} from '@/src/utils/global/atoms'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function MobileSchedule() {
  const {workingDays: days} = useAuth()
  const selectedDay = useAtomValue(selectedDayAtom)
  const [initialDays, setInitialDays] = useState(days)

  const day: Day = useMemo(
    () =>
      days?.find(
        d =>
          d.date?.toFormat('YYYY-MM-dd') ===
          selectedDay.date?.toFormat('YYYY-MM-dd'),
      ) || {
        date: undefined,
      },
    [days, selectedDay],
  )

  const getWeekday = (day: Day) => {
    return day.date?.toFormat('EEE', {locale: 'ru-RU'}) || ''
  }

  const weeks = useMemo(() => {
    const weeks: Day[][] = [[], []]

    days.forEach(day => {
      if (!weeks[0].find(day => getWeekday(day) === 'воскресенье')) {
        weeks[0].push(day)
      } else {
        weeks[1].push(day)
      }
    })

    return weeks
  }, [days])

  useEffect(() => {
    if (initialDays.find(obj => obj?.date)) return
    setInitialDays(days)
  }, [days, initialDays])

  return (
    <div className="flex max-h-[50%] w-full flex-wrap gap-4">
      {days.length ? (
        <>
          <div className="flex flex-wrap gap-4">
            {weeks[0].map((day: Day, index: number) => (
              <DayButton day={day} key={index} className="flex-1" />
            ))}
          </div>
          <Divider />
          <div className="flex flex-wrap gap-4">
            {weeks[1].map((day: Day, index: number) => (
              <DayButton day={day} key={index} className="flex-1" />
            ))}
          </div>
        </>
      ) : (
        <i className="opacity-50">Дат пока нет..</i>
      )}
      <Divider />
      <DayInfo day={day} />
      <SendButton
        days={days.filter(day => {
          const initialDay = initialDays.find(
            initDay =>
              initDay.date?.toFormat('YYYY-MM-dd') ===
              day.date?.toFormat('YYYY-MM-dd'),
          )
          return (
            day.value !== initialDay?.value ||
            day.comment !== initialDay?.comment
          )
        })}
      />
    </div>
  )
}
