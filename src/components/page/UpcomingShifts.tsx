import convertTZ from '@/lib/functions/convertTZ'
import {Card, CardBody, CardHeader} from '@heroui/react'
import {CalendarMinimalistic, ClockCircle, MapPoint} from 'solar-icon-set'
import {useAtomValue} from 'jotai'
import {daysAtom} from '@/src/utils/global/atoms'

export default function UpcomingShifts({className = ''}: {className?: string}) {
  const days = useAtomValue(daysAtom)

  const currentDate = new Date()

  const getDatesDiff = (date?: Date) => {
    // @ts-ignore
    const diffTime = date - currentDate
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
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
                  {day.date?.toLocaleDateString('ru-RU', {
                    month: 'numeric',
                    day: 'numeric',
                    weekday: 'short',
                  })}
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
