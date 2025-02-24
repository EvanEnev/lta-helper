import {Divider} from "@heroui/react"
import DayButton from './DayButton'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import daysState from '@/src/state/daysState'
import selectedDayState from '@/src/state/selectedDayState'
import {Day} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {useRecoilValue} from 'recoil'

export default function MobileSchedule() {
  const days = useRecoilValue(daysState)
  const selectedDay = useRecoilValue(selectedDayState)
  const [initialDays, setInitialDays] = useState(days)

  const day: Day = useMemo(
    () =>
      days?.find(d => d.date?.getTime() === selectedDay.date?.getTime()) || {
        date: undefined,
      },
    [days, selectedDay],
  )

  const getWeekday = (day: Day) => {
    return (
      day.date?.toLocaleDateString('ru-RU', {
        weekday: 'long',
      }) || ''
    )
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
    <div className="flex gap-4 w-full max-h-[50%] flex-wrap">
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
            initDay => initDay.date?.getTime() === day.date?.getTime(),
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
