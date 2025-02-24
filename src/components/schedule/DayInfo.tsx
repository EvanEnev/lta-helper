import daysState from '@/src/state/daysState'
import selectedDayState from '@/src/state/selectedDayState'
import {Day, LocationData} from '@/src/utils/types'
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Card,
  CardBody,
  Input,
} from '@heroui/react'
import {useMemo} from 'react'
import {useRecoilState, useRecoilValue} from 'recoil'
import PossibilityButton from './PossibilityButton'
import SlashDivider from './SlashDivider'
import CommenTemplates from './CommentTemplates'
import selectedDatesState from '@/src/state/selectedDatesState'
import {MinusCircle, QuestionCircle} from 'solar-icon-set'
import groupBy from '@/src/utils/groupBy'
import {useSession} from 'next-auth/react'

export default function DayInfo({day}: {day: Day}) {
  const [selectedDay, setSelectedDay] = useRecoilState(selectedDayState)
  const selectedDates = useRecoilValue(selectedDatesState)
  const [days, setDays] = useRecoilState(daysState)
  const {data: session} = useSession()

  const locationData: LocationData[] = useMemo(() => {
    return day.locationData || []
  }, [day])

  const currentDate: any = useMemo(() => new Date(), [])

  const possibilityHandler = (value: string) => {
    if (value !== '-') setSelectedDay({...selectedDay, invalidComment: false})
    if (value === day?.value) return

    if (selectedDates.length > 1) {
      const newDays = days.map(curDay =>
        selectedDates.find(date => date.getTime() === curDay.date?.getTime())
          ? {...curDay, value}
          : curDay,
      )

      setDays(newDays)
    } else {
      const newDay: Day = {...day, value}
      const newDays = days.map(selectedDay =>
        day.date?.getTime() === selectedDay.date?.getTime()
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
        selectedDates.find(date => date.getTime() === curDay.date?.getTime())
          ? {...curDay, comment: text}
          : curDay,
      )

      setDays(newDays)
    } else {
      const newDay: Day = {...day, comment: text}
      const newDays = days.map(selectedDay =>
        selectedDay.date?.getTime() === day.date?.getTime()
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
        isAdmin={session?.user.permission_level === 4}
        location={session?.user.location}
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
            session?.user.rank &&
            session?.user.rank.toLowerCase() !== 'актёр') ||
          day?.value === '+/-'
        }
        onChange={commentHandler}
        color={day?.invalidComment ? 'danger' : 'default'}
      />
      <CommenTemplates
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
                      <div className="flex gap-2 flex-1 flex-wrap" key={index}>
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
