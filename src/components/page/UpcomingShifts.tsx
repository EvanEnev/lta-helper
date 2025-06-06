import {Card, CardBody, CardHeader} from '@heroui/react'
import {CalendarMinimalistic, ClockCircle, MapPoint} from 'solar-icon-set'
import {DateTime} from 'luxon'
import convertTZ from '@/lib/functions/convertTZ'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function UpcomingShifts({className = ''}: {className?: string}) {
  const {workingDays: days} = useAuth()

  const currentDate = convertTZ(new Date(), 'Europe/Moscow')

  const getDatesDiff = (date?: DateTime) => {
    if (!date) return -1

    return -1 * parseInt(currentDate.diff(date).toFormat('dd'))
  }

  return (
    <Card isBlurred className={`w-full max-w-fit ${className}`}>
      <CardHeader className="text-3xl">Ближайшие смены</CardHeader>
      <CardBody className="flex flex-row gap-4 overflow-auto">
        {days
          .filter(
            day =>
              getDatesDiff(day.date) <= 5 &&
              getDatesDiff(day.date) >= 0 &&
              day.locationData?.length,
          )
          .map((day, index) => {
            const dayData = day.locationData?.find(data => data.self)

            return (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-xl border-1 p-4">
                <span className="flex items-center gap-1">
                  <CalendarMinimalistic />
                  {day.date?.toFormat('dd.MM EEE', {locale: 'ru-RU'})}
                </span>
                <span className="flex items-center gap-1">
                  <MapPoint />
                  {dayData?.locationName}
                </span>
                <span className="flex items-center gap-1">
                  <ClockCircle />
                  {dayData?.data?.time}
                </span>
              </div>
            )
          })}
      </CardBody>
    </Card>
  )
}
