import convertTZ from '@/lib/functions/convertTZ'
import {Card, CardBody, CardHeader} from '@heroui/react'
import {CalendarMinimalistic, ClockCircle, MapPoint} from 'solar-icon-set'
import {useAtomValue} from 'jotai'
import {daysAtom} from '@/src/utils/global/atoms'

export default function UpcomingShifts({className = ''}: {className?: string}) {
  const days = useAtomValue(daysAtom)

  const currentDate = convertTZ(new Date(), 'Europe/Moscow')

  const getDatesDiff = (date?: Date) => {
    // @ts-ignore
    const diffTime = date - currentDate
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <Card isBlurred className={`w-full max-w-fit ${className}`}>
      <CardHeader className="text-3xl">Ближайшие смены</CardHeader>
      <CardBody className="flex gap-4 overflow-auto flex-row">
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
                className="flex gap-4 flex-col border-1 rounded-xl p-4">
                <span className="items-center flex gap-1">
                  <CalendarMinimalistic />
                  {day.date?.toLocaleDateString('ru-RU', {
                    month: 'numeric',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </span>
                <span className="items-center flex gap-1">
                  <MapPoint />
                  {dayData?.locationName}
                </span>
                <span className="items-center flex gap-1">
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
