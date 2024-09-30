import daysState from '@/src/state/daysState'
import selectedDayState from '@/src/state/selectedDayState'
import workerState from '@/src/state/workerState'
import {Day} from '@/src/utils/types'
import {Button, Card, CardBody, Input} from '@nextui-org/react'
import {useMemo} from 'react'
import {useRecoilState, useRecoilValue} from 'recoil'

export default function DayInfo() {
  const [selectedDay, setSelectedDay] = useRecoilState(selectedDayState)
  const [days, setDays] = useRecoilState(daysState)
  const worker = useRecoilValue(workerState)

  const day: Day = useMemo(
    () => days?.find(d => d.date === selectedDay.date) || {date: ''},
    [days, selectedDay],
  )

  const currentDate: any = useMemo(() => new Date(), [])

  const possibilityHandler = (value: string) => {
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

  const isDisabled = useMemo(() => {
    if (!selectedDay.date) return true
    if (!day.location) return false

    const dayProps = selectedDay.date.split('.')
    const dayProp = parseInt(dayProps[0])
    const monthProp = parseInt(dayProps[1])

    const selectedDate: any = new Date()

    selectedDate.setDate(dayProp)
    selectedDate.setMonth(monthProp - 1)

    const diffTime = Math.abs(selectedDate - currentDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1 && day.location) return true
  }, [currentDate, day.location, selectedDay.date])

  return (
    <div className="w-full flex flex-col gap-4">
      {isDisabled && selectedDay.date && (
        <Card className="bg-warning/70 h-18">
          <CardBody className="justify-center items-center">
            <p>Нельзя изменить график за день до смены</p>
            <p>Необходимо написать старшему площадки</p>
          </CardBody>
        </Card>
      )}
      <Button
        isDisabled={isDisabled}
        className="h-14"
        size="lg"
        color={day?.value === '+' ? 'success' : 'default'}
        onClick={() => possibilityHandler('+')}>
        Могу
      </Button>

      <Button
        isDisabled={isDisabled}
        className="h-14"
        size="lg"
        color={day?.value === '-' ? 'danger' : 'default'}
        onClick={() => possibilityHandler('-')}>
        Не могу
      </Button>

      <Button
        isDisabled={isDisabled}
        className="h-14"
        size="lg"
        color={day?.value === '+/-' ? 'warning' : 'default'}
        onClick={() => possibilityHandler('+/-')}>
        С ограничением
      </Button>
      <Input
        isDisabled={isDisabled}
        label={day?.value === '-' ? 'Причина' : 'Комментарий'}
        size="lg"
        value={day?.comment || ''}
        isRequired={
          (day?.value === '-' && worker.type === 'worker') ||
          day?.value === '+/-'
        }
        onChange={commentHandler}
        color={selectedDay?.invalidComment ? 'danger' : 'default'}
      />
      <Card className="h-16">
        <CardBody className="justify-center text-xl">
          {day?.location || (
            <span className="opacity-70 italic">Ещё никто не забрал</span>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
