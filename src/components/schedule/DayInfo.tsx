import daysState from '@/src/state/daysState'
import selectedDayState from '@/src/state/selectedDayState'
import {Day} from '@/src/utils/types'
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Tooltip,
} from '@nextui-org/react'
import {useMemo} from 'react'
import {useRecoilState} from 'recoil'

export default function DayInfo() {
  const [selectedDay, setSelectedDay] = useRecoilState(selectedDayState)
  const [days, setDays] = useRecoilState(daysState)

  const day: Day = useMemo(
    () => days?.find(d => d.date === selectedDay.date) || {date: ''},
    [days, selectedDay],
  )

  const possibilityHandler = (value: string) => {
    // const value = event.target.value

    if (value !== '-') setSelectedDay({...selectedDay, invalidComment: false})
    if (value === day?.value) return

    const newDay: Day = {...day, value}
    const newDays = days.map(day =>
      day.date === selectedDay.date ? newDay : day,
    )

    setDays(newDays)
  }

  const commentHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDay({...selectedDay, invalidComment: false})
    const text = event.target.value || ''
    const newDay: Day = {...day, comment: text}
    const newDays = days.map(day =>
      day.date === selectedDay.date ? newDay : day,
    )

    setDays(newDays)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Button
        className="h-14"
        size="lg"
        color={day?.value === '+' ? 'success' : 'default'}
        onClick={() => possibilityHandler('+')}>
        Могу
      </Button>

      <Button
        className="h-14"
        size="lg"
        color={day?.value === '-' ? 'danger' : 'default'}
        onClick={() => possibilityHandler('-')}>
        Не могу
      </Button>

      <Button
        className="h-14"
        size="lg"
        color={day?.value === '+/-' ? 'warning' : 'default'}
        onClick={() => possibilityHandler('+/-')}>
        По договорённости
      </Button>
      <Input
        label="Комментарий"
        size="lg"
        value={day?.comment || ''}
        isRequired={day?.value === '-'}
        onChange={commentHandler}
        color={selectedDay?.invalidComment ? 'danger' : 'default'}
      />
      <Card className="h-16">
        <CardBody className="justify-center text-xl">
          {day?.location?.name || (
            <span className="opacity-70 italic">Ещё никто не забрал</span>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
