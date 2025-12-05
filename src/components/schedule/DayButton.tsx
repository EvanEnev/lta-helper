import {Day, LTLocation} from '@/src/utils/types'
import {Badge, Button, Skeleton} from '@heroui/react'
import {useMemo, useState} from 'react'
import {useAtom, useSetAtom} from 'jotai'
import {selectedDatesAtom, selectedDayAtom} from '@/src/utils/global/atoms'
import {DateTime} from 'luxon'
import AnimatedBorder from '@/src/components/global/AnimatedBorder'
import {useLongPress} from '@/src/hooks/useLongPress'

type DayButtonProps = {
  day: Day
  locations: LTLocation[]
  color?: 'default' | 'success' | 'danger' | 'warning'
  onclick?: any
  isSelected?: boolean
  className?: string
  disabled?: boolean
}

export default function DayButton(props: DayButtonProps) {
  const day = props.day
  const locations = props.locations

  const [isLongPress, setIsLongPress] = useState(false)

  const longPress = useLongPress(() => {
    setIsLongPress(true)
    setSelectedDates(prev => (day.date ? [...prev, day.date] : prev))
  }, 300)

  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom)
  const setSelectedDay = useSetAtom(selectedDayAtom)

  let color: 'default' | 'success' | 'danger' | 'warning' = 'default'
  if (
    day.value === '+' ||
    locations.find(l => l.name.toLowerCase() === day.value?.toLowerCase())
  )
    color = 'success'
  if (day.value === '-') color = 'danger'
  if (day.value === '+/-') color = 'warning'

  const handler = () => {
    if (isLongPress) {
      setIsLongPress(false)
      return
    }

    if (props.onclick) {
      return props.onclick()
    }

    setSelectedDay(day)

    setSelectedDates(prev => {
      if (!day.date) return prev

      if (prev.length <= 1) {
        return [day.date]
      }

      const index = prev.findIndex(selectedDate => selectedDate === day.date)
      if (index === -1) {
        return [...prev, day.date]
      } else {
        return prev.filter((_, i) => i !== index)
      }
    })
  }

  const weekday = useMemo(() => {
    return day.date?.toFormat('EEE', {locale: 'ru-RU'})
  }, [day.date])

  const today = DateTime.now()

  const isSelected = useMemo(() => {
    return props.isSelected
      ? props.isSelected
      : selectedDates.find(selectedDate => selectedDate === day.date) !==
          undefined
  }, [selectedDates, props.isSelected, day.date])

  return !day.date ? (
    <Skeleton className="h-12 w-28 rounded-[14px]" />
  ) : (
    <Badge
      variant="solid"
      color="primary"
      content=""
      placement="top-left"
      size="md"
      isInvisible={!isSelected}
      classNames={{
        base: props.className || '',
        badge: 'justify-center items-center',
      }}>
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
        <AnimatedBorder
          isDisabled={
            today.toFormat('yyyy-MM-dd') !== day.date?.toFormat('yyyy-MM-dd')
          }
          className={props.className || ''}>
          <Button
            isDisabled={props.disabled}
            size="lg"
            className={`w-28 ${props.className || ''} text-lg ${
              isSelected ? '' : 'opacity-60'
            }`}
            color={props.color || color}
            variant={isSelected ? 'shadow' : 'solid'}
            {...longPress}
            onPress={handler}>
            <span className="h-fit w-fit">
              {day.date.toFormat('dd.MM')}, {weekday}
            </span>
          </Button>
        </AnimatedBorder>
      </Badge>
    </Badge>
  )
}
