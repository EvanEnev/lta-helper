import selectedDayState from '@/src/state/selectedDayState'
import {Day} from '@/src/utils/types'
import {Button, Skeleton} from '@nextui-org/react'
import {useRecoilValue, useSetRecoilState} from 'recoil'

type DayButtonProps = {
  day: Day
}

export default function DayButton({day}: DayButtonProps) {
  const setSelectedDay = useSetRecoilState(selectedDayState)

  const selectedDay = useRecoilValue(selectedDayState)

  let color: 'default' | 'success' | 'danger' | 'warning' = 'default'
  if (day.value === '+') color = 'success'
  if (day.value === '-') color = 'danger'
  if (day.value === '+/-') color = 'warning'

  const handler = () => {
    if (selectedDay.date === day.date) return

    setSelectedDay({date: day.date})
  }

  return day.value === undefined ? (
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
      {day.date}
    </Button>
  )
}
