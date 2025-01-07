import daysState from '@/src/state/daysState'
import selectedDayState from '@/src/state/selectedDayState'
import workerState from '@/src/state/workerState'
import {Day, LocationData} from '@/src/utils/types'
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  Input,
} from '@nextui-org/react'
import {useMemo} from 'react'
import {useRecoilState, useRecoilValue} from 'recoil'
import PossibilityButton from './PossibilityButton'
import SlashDivider from './SlashDivider'
import CommenTemplates from './CommentTemplates'

export default function DayInfo() {
  const [selectedDay, setSelectedDay] = useRecoilState(selectedDayState)
  const [days, setDays] = useRecoilState(daysState)
  const worker = useRecoilValue(workerState)

  const day: Day = useMemo(
    () => days?.find(d => d.date === selectedDay.date) || {date: ''},
    [days, selectedDay],
  )

  const locationData: LocationData[] = useMemo(() => {
    if (!day.location) return []

    return day.locationData || []
  }, [day])

  const selfLocationData: LocationData = useMemo(() => {
    if (!day.location) return {self: false}

    return day.locationData?.find(data => data?.self) || {self: false}
  }, [day])

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

  const commentHandler = (
    event: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    setSelectedDay({...selectedDay, invalidComment: false})
    const text = typeof event === 'string' ? event : event?.target?.value
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

    const diffTime = selectedDate - currentDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1 || diffDays === 0) return true
  }, [currentDate, day.location, selectedDay.date])

  const title = `${selfLocationData.data?.worker} ${selfLocationData.data?.time}`

  return (
    <div className="w-full flex flex-col gap-4">
      {isDisabled && selectedDay.date && (
        <Card className="bg-warning/70 h-18">
          <CardBody className="justify-center items-center">
            <p>Нельзя изменить график за день до или в день смены</p>
            <p>
              Необходимо написать старшему площадки и в топик График LT Arena
            </p>
          </CardBody>
        </Card>
      )}

      <PossibilityButton
        isAdmin={worker?.isAdmin}
        location={worker?.location}
        value={day?.value}
        isDisabled={isDisabled}
        handler={value => possibilityHandler(value)}
        selectedValue={day?.value}
      />

      <Button
        isDisabled={isDisabled}
        className="h-14"
        size="lg"
        color={day?.value === '-' ? 'danger' : 'default'}
        onPress={() => possibilityHandler('-')}>
        Не могу
      </Button>
      <Button
        isDisabled={isDisabled}
        className="h-14"
        size="lg"
        color={day?.value === '+/-' ? 'warning' : 'default'}
        onPress={() => possibilityHandler('+/-')}>
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
      <CommenTemplates
        onChange={commentHandler}
        selected={day?.comment || ''}
      />
      <Card className="h-16">
        <CardBody className="justify-center text-xl">
          {day?.location || (
            <span className="opacity-70 italic">Ещё никто не забрал</span>
          )}
        </CardBody>
      </Card>

      {selfLocationData && Object.keys(selfLocationData)?.length > 1 && (
        <Accordion variant="shadow">
          <AccordionItem key="1" title={title}>
            {locationData.map(({data}, index) => {
              return (
                <div key={index} className="py-1">
                  <div className="flex gap-2 flex-1 flex-wrap">
                    <span>{data?.rank}</span>
                    <SlashDivider />
                    <span>{data?.worker}</span>
                    <SlashDivider />
                    <span>{data?.time}</span>
                  </div>
                  {data?.role && <span className="pl-2">{data?.role}</span>}
                </div>
              )
            })}
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}
