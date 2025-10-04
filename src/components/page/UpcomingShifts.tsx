import {Card, CardBody, CardHeader} from '@heroui/react'
import {CalendarMinimalistic, ClockCircle} from 'solar-icon-set'
import {DateTime} from 'luxon'
import convertTZ from '@/lib/functions/convertTZ'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {useMemo, useCallback} from 'react'
import Location from '@/src/components/global/Location'

export default function UpcomingShifts({className = ''}: {className?: string}) {
  const {workingDays: days} = useAuth()

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
              <div
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
              </div>
            )
          })
        ) : (
          <i>Тут пока пусто..</i>
        )}
      </CardBody>
    </Card>
  )
}
