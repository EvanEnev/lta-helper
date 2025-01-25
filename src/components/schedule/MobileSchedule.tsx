import {Divider} from '@nextui-org/react'
import DayButton from './DayButton'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import daysState from '@/src/state/daysState'
import selectedDayState from '@/src/state/selectedDayState'
import {Day} from '@/src/utils/types'
import {useMemo} from 'react'
import {useRecoilValue} from 'recoil'

export default function MobileSchedule() {
  const days = useRecoilValue(daysState)
  const selectedDay = useRecoilValue(selectedDayState)

  const day: Day = useMemo(
    () => days?.find(d => d.date === selectedDay.date) || {date: ''},
    [days, selectedDay],
  )

  const getWeekday = (day: Day) => {
    const dayProps = day.date.split('.')
    const dayProp = parseInt(dayProps[0])
    const monthProp = parseInt(dayProps[1])

    const date: any = new Date()

    date.setDate(dayProp)
    date.setMonth(monthProp - 1)

    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
    })
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

  return (
    <div className="flex  gap-4 w-full max-h-[50%] flex-wrap">
      {days.length ? (
        <>
          {weeks[0].map((day: Day, index: number) => (
            <DayButton day={day} key={index} />
          ))}
          <Divider />
          {weeks[1].map((day: Day, index: number) => (
            <DayButton day={day} key={index} />
          ))}
        </>
      ) : (
        <i className="opacity-50">Дат пока нет..</i>
      )}
      <Divider />
      <DayInfo day={day} />
      <SendButton />
    </div>
  )
}
