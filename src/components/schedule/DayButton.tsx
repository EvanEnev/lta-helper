import selectedDayState from '@/src/state/selectedDayState'
import {Day} from '@/src/utils/types'
import {Button, Skeleton} from '@nextui-org/react'
import {useMemo} from 'react'
import {useRecoilValue, useSetRecoilState} from 'recoil'

type DayButtonProps = {
  day: Day
  color?: 'default' | 'success' | 'danger' | 'warning'
  onclick?: any
  isSelected?: boolean
}

export default function DayButton(props: DayButtonProps) {
  const day = props.day
  const setSelectedDay = useSetRecoilState(selectedDayState)

  const selectedDay = useRecoilValue(selectedDayState)

  let color: 'default' | 'success' | 'danger' | 'warning' = 'default'
  if (day.value === '+') color = 'success'
  if (day.value === '-') color = 'danger'
  if (day.value === '+/-') color = 'warning'

  const handler = () => {
    if (props.onclick) {
      return props.onclick()
    }

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

  const isSelected = props.isSelected
    ? props.isSelected
    : selectedDay.date === day.date
  return !day.date ? (
    <Skeleton className="w-28 h-12 rounded-[14px]" />
  ) : (
    <Button
      size="lg"
      className={`w-28 text-lg ${isSelected ? '' : 'opacity-60'}`}
      color={props.color || color}
      variant={isSelected ? 'shadow' : 'solid'}
      onClick={handler}>
      {day?.location ? <span className="absolute left-2 top-0">+</span> : ''}
      <span className="h-fit w-fit">
        {day.date}, {weekday}
      </span>
    </Button>
  )
}
