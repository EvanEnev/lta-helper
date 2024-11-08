import selectedDayState from '@/src/state/selectedDayState'
import locations from '@/src/utils/locations'
import {Day} from '@/src/utils/types'
import {Button, Skeleton} from '@nextui-org/react'
import {useMemo} from 'react'
import {useRecoilValue, useSetRecoilState} from 'recoil'

type DayButtonProps = {
  day: Day
}

export default function DayButton({day}: DayButtonProps) {
  const setSelectedDay = useSetRecoilState(selectedDayState)

  const selectedDay = useRecoilValue(selectedDayState)

  let color: 'default' | 'success' | 'danger' | 'warning' = 'default'
  if (
    day.value === '+' ||
    locations.find(l => l.toLowerCase() === day.value?.toLowerCase())
  )
    color = 'success'
  if (day.value === '-') color = 'danger'
  if (day.value === '+/-') color = 'warning'

  const handler = () => {
    if (selectedDay.date === day.date) return

    setSelectedDay({date: day.date})
  }

  const weekday = useMemo(() => {
    const dayProps = day.date.split('.')
    const dayProp = parseInt(dayProps[0])
    const monthProp = parseInt(dayProps[1])

    const date: any = new Date()

    date.setDate(dayProp)
    date.setMonth(monthProp - 1)

    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
    })
  }, [day.date])

  return !day.date ? (
    <Skeleton className="w-28 h-12 rounded-[14px]" />
  ) : (
    <Button
      size="lg"
      className={`w-28 text-lg ${
        selectedDay.date === day.date ? '' : 'opacity-60'
      }`}
      color={color}
      variant={selectedDay.date === day.date ? 'shadow' : 'solid'}
      onClick={handler}>
      {day?.location ? <span className="absolute left-2 top-0">+</span> : ''}
      <span className="h-fit w-fit">
        {day.date}, {weekday}
      </span>
    </Button>
  )
}
