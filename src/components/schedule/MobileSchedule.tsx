import {Divider} from '@heroui/react'
import DayButton from './DayButton'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import {Day, LTLocation} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {useAtom, useAtomValue} from 'jotai'
import {daysAtom, selectedDayAtom} from '@/src/utils/global/atoms'
import {useAuth} from '@/src/components/global/providers/authProvider'

interface MobileScheduleProps {
  locations: LTLocation[]
}

export default function MobileSchedule({locations}: MobileScheduleProps) {
  const {workingDays, setExiting} = useAuth()
  const selectedDay = useAtomValue(selectedDayAtom)
  const [initialDays, setInitialDays] = useState(workingDays)
  const [days, setDays] = useAtom(daysAtom)

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

    let index = 0

    days.forEach(day => {
      if (!weeks[index]) weeks[index] = []

      weeks[index].push(day)

      if (getWeekday(day) === 'вс') {
        index++
      }
    })

    return weeks
  }, [days])

  useEffect(() => {
    setDays(workingDays)
  }, [workingDays, setDays])

  useEffect(() => {
    if (initialDays.find(obj => obj?.date)) return
    setInitialDays(days)
  }, [days, initialDays])

  useEffect(() => {
    setExiting(false)
  }, [setExiting])

  return (
    <div className="flex max-h-[50%] w-full flex-wrap gap-4">
      {days.length ? (
        weeks.map((week, index) => (
          <>
            {index !== 0 && <Divider />}
            <div className="flex flex-wrap gap-4" key={index}>
              {week.map((day, index) => (
                <DayButton
                  locations={locations}
                  day={day}
                  key={index}
                  className="flex-1"
                />
              ))}
            </div>
          </>
        ))
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
