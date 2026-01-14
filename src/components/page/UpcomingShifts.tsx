import {Card, CardBody, CardHeader, Skeleton} from '@heroui/react'
import {CalendarMinimalistic, ClockCircle} from 'solar-icon-set'
import {DateTime} from 'luxon'
import convertTZ from '@/lib/functions/convertTZ'
import {useMemo, useCallback} from 'react'
import Location from '@/src/components/global/Location'
import {Day} from "@/src/utils/types";

interface UpcomingShiftsProps {
className?: string
workingDays: Day[]
}

export default function UpcomingShifts({className = '', workingDays}: UpcomingShiftsProps) {
    // @ts-ignore
  const days = useMemo(() => workingDays.map(d => ({...d, date: DateTime.fromISO(d.date)})), [workingDays])

    const currentDate = convertTZ(new Date(), 'Europe/Moscow')

  const getDatesDiff = useCallback(
    (date?: DateTime) => {
      if (!date) return -1

      return -1 * parseInt(currentDate.diff(date).toFormat('dd'))
    },
    [currentDate],
  )

  const filteredDats = useMemo(() => {
    return days.filter(
      day =>
        getDatesDiff(day.date) <= 5 &&
        getDatesDiff(day.date) >= 0 &&
        day.locationData?.length,
    )
  }, [days, getDatesDiff])

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="text-3xl">Ближайшие смены</CardHeader>
      <CardBody className="flex max-w-full flex-row gap-4 overflow-auto">
        {filteredDats.length ? (
          filteredDats.map((day, index) => {
            const dayData = day.locationData?.find(data => data.self)

            return (
              <Skeleton
                isLoaded={!!dayData?.locationName}
                key={index}
                className="text-foreground glass flex flex-col gap-4 rounded-xl border-1 p-4">
                <Location locationName={dayData?.locationName || ''} />
                <span className="flex items-center gap-1">
                  <CalendarMinimalistic iconStyle="Bold" />
                  {day.date?.toFormat('dd.MM EEE', {locale: 'ru-RU'})}
                </span>
                <span className="flex items-center gap-1">
                  <ClockCircle />
                  {dayData?.data?.time}
                </span>
              </Skeleton>
            )
          })
        ) : (
          <i>Тут пока пусто..</i>
        )}
      </CardBody>
    </Card>
  )
}
