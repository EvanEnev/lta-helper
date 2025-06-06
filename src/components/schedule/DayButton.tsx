import locations from '@/src/utils/locations'
import {Day} from '@/src/utils/types'
import {Badge, Button, Skeleton} from '@heroui/react'
import {useMemo} from 'react'
import {useAtom} from 'jotai'
import {selectedDayAtom} from '@/src/utils/global/atoms'

type DayButtonProps = {
  day: Day
  color?: 'default' | 'success' | 'danger' | 'warning'
  onclick?: any
  isSelected?: boolean
  className?: string
  disabled?: boolean
}

export default function DayButton(props: DayButtonProps) {
  const day = props.day

  const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom)

  let color: 'default' | 'success' | 'danger' | 'warning' = 'default'
  if (
    day.value === '+' ||
    locations.find(l => l.toLowerCase() === day.value?.toLowerCase())
  )
    color = 'success'
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
    return day.date?.toFormat('EEE', {locale: 'ru-RU'})
  }, [day.date])

  const isSelected = props.isSelected
    ? props.isSelected
    : selectedDay.date === day.date
  return !day.date ? (
    <Skeleton className="h-12 w-28 rounded-[14px]" />
  ) : (
    <Badge
      variant="solid"
      color="success"
      content="+"
      size="md"
      isInvisible={!day.locationData?.length}
      classNames={{
        base: props.className || '',
        badge: 'justify-center items-center',
      }}>
      <Button
        isDisabled={props.disabled}
        size="lg"
        className={`w-28 ${props.className || ''} text-lg ${
          isSelected ? '' : 'opacity-60'
        }`}
        color={props.color || color}
        variant={isSelected ? 'shadow' : 'solid'}
        onPress={handler}>
        <span className="h-fit w-fit">
          {day.date.toFormat('dd.MM')}, {weekday}
        </span>
      </Button>
    </Badge>
  )
}
