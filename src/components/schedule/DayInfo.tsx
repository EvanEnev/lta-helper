import {Day, LocationData, LTWorker} from '@/src/utils/types'
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  Input,
  Label,
  Separator,
  TextField,
} from '@heroui/react'
import {Fragment, useMemo} from 'react'
import PossibilityButton from './PossibilityButton'
import SlashDivider from './SlashDivider'
import CommentTemplates from './CommentTemplates'
import groupBy from '@/lib/functions/groupBy'
import {useAtom, useAtomValue} from 'jotai'
import {
  daysAtom,
  selectedDatesAtom,
  selectedDayAtom,
} from '@/src/utils/global/atoms'
import {DateTime} from 'luxon'
import RankIcon from '@/src/components/global/RankIcon'
import sortByRank from '@/lib/functions/sortByRank'
import Location from '@/src/components/global/Location'
import checkPermissions from '@/lib/functions/checkPermissions'
import {Icon} from '@iconify/react'

export default function DayInfo({
  day,
  changeDates,
  worker,
}: {
  day: Day
  changeDates?: (date: DateTime | undefined, isSelected: boolean) => void
  worker: LTWorker
}) {
  const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom)
  const selectedDates = useAtomValue(selectedDatesAtom)
  const [days, setDays] = useAtom(daysAtom)

  const locationData: LocationData[] = useMemo(() => {
    return day.locationData || []
  }, [day])

  const currentDate: any = useMemo(() => new Date(), [])

  const isAdmin = checkPermissions(['set_location_schedule'], worker)

  const possibilityHandler = (value: string) => {
    if (value !== '-') setSelectedDay({...selectedDay, invalidComment: false})
    if (value === day?.value) return

    if (
      selectedDates.length > 1 &&
      selectedDates.find(
        date =>
          date.toFormat('yyyy-MM-dd') === day.date?.toFormat('yyyy-MM-dd'),
      )
    ) {
      const newDays = days.map(curDay =>
        selectedDates.find(
          date =>
            date.toFormat('yyyy-MM-dd') === curDay.date?.toFormat('yyyy-MM-dd'),
        )
          ? {...curDay, value}
          : curDay,
      )

      setDays(newDays)
    } else {
      const newDay: Day = {...day, value}
      const newDays = days.map(selectedDay =>
        day.date?.toFormat('yyyy-MM-dd') ===
        selectedDay.date?.toFormat('yyyy-MM-dd')
          ? newDay
          : selectedDay,
      )

      if (changeDates) changeDates(day.date, false)

      setDays(newDays)
    }
  }

  const commentHandler = (
    event: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    setSelectedDay({...selectedDay, invalidComment: false})
    const text = typeof event === 'string' ? event : event?.target?.value

    if (
      selectedDates.length > 1 &&
      selectedDates.find(
        date =>
          date.toFormat('yyyy-MM-dd') === day.date?.toFormat('yyyy-MM-dd'),
      )
    ) {
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

      if (changeDates) changeDates(day.date, false)
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
          <Card.Content className="items-center justify-center">
            <p>Нельзя изменить график за день до или в день смены</p>
            <p>
              Необходимо написать старшему площадки и в топик График LT Arena
            </p>
          </Card.Content>
        </Card>
      )}

      <PossibilityButton
        isAdmin={isAdmin}
        location={worker.location || ''}
        value={day?.value}
        isDisabled={isDisabled}
        handler={value => possibilityHandler(value)}
        selectedValue={day?.value}
      />

      <Button
        isDisabled={isDisabled}
        className="h-14 w-full"
        slot="icon"
        variant={day?.value === '-' ? 'danger' : 'tertiary'}
        onPress={() => possibilityHandler('-')}>
        <Icon icon="solar:minus-circle-linear" width="24" height="24" />
        Не могу
      </Button>
      <Button
        isDisabled={isDisabled}
        className={`h-14 w-full ${day?.value === '+/-' ? 'bg-warning text-warning-foreground' : ''}`}
        slot="icon"
        variant={'tertiary'}
        onPress={() => possibilityHandler('+/-')}>
        <Icon icon="solar:question-circle-linear" width="24" height="24" />С
        ограничением
      </Button>
      <TextField
        variant="secondary"
        isDisabled={isDisabled}
        value={day?.comment || ''}
        isRequired={
          (day?.value === '-' &&
            worker.rank &&
            worker.rank.toLowerCase() !== 'актёр') ||
          day?.value === '+/-'
        }
        onChange={commentHandler}>
        <Label>{day?.value === '-' ? 'Причина' : 'Комментарий'}</Label>
        <Input />
      </TextField>

      <CommentTemplates
        onChange={commentHandler}
        selected={day?.comment || ''}
      />
      {locationData && (
        <Accordion>
          {Object.keys(groupedData).map((key, index) => {
            const data = groupedData[key]
            if (!data) return <></>

            const sortedData = sortByRank(
              data.map((d: any) => ({
                name: d.data.worker,
                rank: d.data.rank,
                role: d.data.role,
                time: d.data.time,
              })),
            )

            const selfData = data.find((obj: any) => obj.self)

            const title = selfData?.data ? (
              <div className="flex items-center gap-2">
                <Location
                  locationName={selfData.locationName}
                  className="w-fit"
                />
                <SlashDivider />
                {selfData.data.time}
              </div>
            ) : (
              ''
            )

            return (
              <Accordion.Item key={index}>
                <Accordion.Heading>
                  <Accordion.Trigger className="rounded-2xl">
                    {title}
                    <Accordion.Indicator>
                      <Icon
                        icon="solar:alt-arrow-down-linear"
                        width="24"
                        height="24"
                      />
                    </Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>
                    {sortedData.map((data: any, index: number) => {
                      return (
                        <Fragment key={index}>
                          <div>
                            <div className="flex flex-1 flex-wrap gap-2">
                              <RankIcon
                                rank={data?.rank || ''}
                                className="h-8"
                              />
                              <SlashDivider />
                              <span>{data?.name}</span>
                              <SlashDivider />
                              <span>{data?.time}</span>
                            </div>
                            {data?.role && (
                              <span className="pl-2">
                                <b>Роль:</b> {data?.role}
                              </span>
                            )}
                          </div>
                          {index !== sortedData.length - 1 && <Separator />}
                        </Fragment>
                      )
                    })}
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}
