import {Divider} from '@heroui/react'
import DayButton from './DayButton'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import {Day} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {useAtomValue} from 'jotai'
import {daysAtom, selectedDayAtom} from '@/src/utils/global/atoms'

export default function MobileSchedule() {
  const days = useAtomValue(daysAtom)
  const selectedDay = useAtomValue(selectedDayAtom)
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

      let index = 0

      days.forEach(day => {
          if (!weeks[index]) weeks[index] = []

          weeks[index].push(day)

          if (getWeekday(day) === 'воскресенье') {
              index++
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
            weeks.map((week, index) => (
                <>
                    {index !== 0 && <Divider />}
                    <div className='flex flex-wrap gap-4' key={index}>
                    {week.map((day, index) => (
                        <DayButton day={day} key={index} className="flex-1" />
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
