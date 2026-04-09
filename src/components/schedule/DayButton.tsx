import {Day, LTLocation} from '@/src/utils/types'
import {Badge, Button} from '@heroui/react'
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

  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom)
  const setSelectedDay = useSetAtom(selectedDayAtom)

  const longPress = useLongPress(() => {
    setIsLongPress(true)
    setSelectedDates(prev => (day.date ? [...prev, day.date] : prev))
  }, 300)

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

  const today = DateTime.now()

  const isSelected = useMemo(() => {
    return props.isSelected
      ? props.isSelected
      : selectedDates.find(selectedDate => selectedDate === day.date) !==
          undefined
  }, [selectedDates, props.isSelected, day.date])

  let bg = ''

  switch (props.day.value) {
    case '+':
      bg = 'bg-success text-success-foreground'
      break
    case '-':
      bg = 'bg-danger text-danger-foreground'
      break
    case '+/-':
      bg = 'bg-warning text-warning-foreground'
      break
  }

  if (locations.find(l => l.name.toLowerCase() === day.value?.toLowerCase())) {
    bg = 'bg-accent text-accent-foreground'
  }
  return (
    <Badge.Anchor className="grow">
      {isSelected && (
        <Badge
          className="z-100"
          size="sm"
          placement="top-left"
          color="accent"
        />
      )}
      {day.locationData && day.locationData.length > 0 && (
        <Badge
          className="z-100"
          size="sm"
          placement="top-right"
          color="success">
          +
        </Badge>
      )}
      <AnimatedBorder
        isDisabled={
          today.toFormat('yyyy-MM-dd') !== day.date?.toFormat('yyyy-MM-dd')
        }
        className={props.className || ''}>
        <Button
          isDisabled={props.disabled}
          className={`${props.className || ''} text-lg ${bg}`}
          variant={isSelected ? 'tertiary' : 'tertiary'}
          {...longPress}
          onPress={handler}>
          <span className="h-fit w-fit">
            {day.date?.toFormat('dd.MM, EEE', {locale: 'ru-RU'})}
          </span>
        </Button>
      </AnimatedBorder>
    </Badge.Anchor>
  )
}
