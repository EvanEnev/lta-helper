import {Day, LocationData} from '@/src/utils/types'
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  Input,
} from '@heroui/react'
import {useMemo} from 'react'
import PossibilityButton from './PossibilityButton'
import SlashDivider from './SlashDivider'
import CommentTemplates from './CommentTemplates'
import {MinusCircle, QuestionCircle} from 'solar-icon-set'
import groupBy from '@/lib/functions/groupBy'
import {useAtom, useAtomValue} from 'jotai'
import {
  daysAtom,
  selectedDatesAtom,
  selectedDayAtom,
} from '@/src/utils/global/atoms'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function DayInfo({day}: {day: Day}) {
  const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom)
  const selectedDates = useAtomValue(selectedDatesAtom)
  const [days, setDays] = useAtom(daysAtom)
  const {worker} = useAuth()

  const locationData: LocationData[] = useMemo(() => {
    return day.locationData || []
  }, [day])

  const currentDate: any = useMemo(() => new Date(), [])

  const possibilityHandler = (value: string) => {
    if (value !== '-') setSelectedDay({...selectedDay, invalidComment: false})
    if (value === day?.value) return

    if (selectedDates.length > 1) {
      const newDays = days.map(curDay =>
        selectedDates.find(
          date =>
            date.toFormat('YYYY-MM-dd') === curDay.date?.toFormat('YYYY-MM-dd'),
        )
          ? {...curDay, value}
          : curDay,
      )

      setDays(newDays)
    } else {
      const newDay: Day = {...day, value}
      const newDays = days.map(selectedDay =>
        day.date?.toFormat('YYYY-MM-dd') ===
        selectedDay.date?.toFormat('YYYY-MM-dd')
          ? newDay
          : selectedDay,
      )

      setDays(newDays)
    }
  }

  const commentHandler = (
    event: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    setSelectedDay({...selectedDay, invalidComment: false})
    const text = typeof event === 'string' ? event : event?.target?.value

    if (selectedDates.length > 1) {
      const newDays = days.map(curDay =>
        selectedDates.find(
          date =>
            date.toFormat('YYYY-MM-dd') === curDay.date?.toFormat('YYYY-MM-dd'),
        )
          ? {...curDay, comment: text}
          : curDay,
      )

      setDays(newDays)
    } else {
      const newDay: Day = {...day, comment: text}
      const newDays = days.map(selectedDay =>
        selectedDay.date?.toFormat('YYYY-MM-dd') ===
        day.date?.toFormat('YYYY-MM-dd')
          ? newDay
          : selectedDay,
      )

      setDays(newDays)
    }
  }

  const isDisabled = useMemo(() => {
    if (!day.date) return true
    if (!day.location) return false

    const selectedDate: any = day.date

    const diffTime = selectedDate - currentDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1 || diffDays === 0) return true
  }, [currentDate, day.date, day.location])

  const groupedData = groupBy(locationData, 'locationName')

  return (
    <div className="flex w-full flex-col gap-4">
      {isDisabled && selectedDay.date && (
        <Card className="bg-warning/70 h-18">
          <CardBody className="items-center justify-center">
            <p>Нельзя изменить график за день до или в день смены</p>
            <p>
              Необходимо написать старшему площадки и в топик График LT Arena
            </p>
          </CardBody>
        </Card>
      )}

      <PossibilityButton
        isAdmin={worker.permissionLevel === 4}
        location={worker.location}
        value={day?.value}
        isDisabled={isDisabled}
        handler={value => possibilityHandler(value)}
        selectedValue={day?.value}
      />

      <Button
        isDisabled={isDisabled}
        startContent={<MinusCircle size={24} />}
        className="h-14"
        size="lg"
        color={day?.value === '-' ? 'danger' : 'default'}
        onPress={() => possibilityHandler('-')}>
        Не могу
      </Button>
      <Button
        isDisabled={isDisabled}
        startContent={<QuestionCircle size={24} />}
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
          (day?.value === '-' &&
            worker.rank &&
            worker.rank.toLowerCase() !== 'актёр') ||
          day?.value === '+/-'
        }
        onChange={commentHandler}
        color={day?.invalidComment ? 'danger' : 'default'}
      />
      <CommentTemplates
        onChange={commentHandler}
        selected={day?.comment || ''}
      />
      {locationData && (
        <Accordion variant="splitted">
          {Object.keys(groupedData).map((key, index) => {
            const data = groupedData[key]
            if (!data) return <></>

            const selfData = data.find((obj: any) => obj.self)

            const title = selfData?.data
              ? `${selfData.data.worker} ${selfData.locationName} ${selfData.data.time}`
              : ''
            return (
              <AccordionItem key={index} className="py-1" title={title}>
                {data.map((data: any, index: number) => {
                  return (
                    <>
                      <div className="flex flex-1 flex-wrap gap-2" key={index}>
                        <span>{data.data?.rank}</span>
                        <SlashDivider />
                        <span>{data.data?.worker}</span>
                        <SlashDivider />
                        <span>{data.data?.time}</span>
                      </div>
                      {data.data?.role && (
                        <span className="pl-2">{data.data?.role}</span>
                      )}
                    </>
                  )
                })}
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}
