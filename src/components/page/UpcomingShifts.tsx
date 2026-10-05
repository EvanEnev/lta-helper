import Link from 'next/link'
import {ArrowUpRight, Clock} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Location from '@/src/components/global/Location'
import type {Shift} from '@/src/components/page/shifts'
import {cn} from '@/lib/utils'

interface UpcomingShiftsProps {
  shifts: Shift[]
  className?: string
}

const dayLabel = (shift: Shift) => {
  if (shift.daysLeft === 0) return 'Сегодня'
  if (shift.daysLeft === 1) return 'Завтра'
  return shift.date.setLocale('ru').toFormat('cccc')
}

const dateLabel = (shift: Shift) => shift.date.setLocale('ru').toFormat('dd.MM')

export default function UpcomingShifts({
  shifts,
  className,
}: UpcomingShiftsProps) {
  const [next, ...rest] = shifts.slice(0, 5)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Ближайшие смены</CardTitle>
        <CardDescription>Ваше расписание на ближайшие дни</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/schedule" />}>
            Расписание
            <ArrowUpRight />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {next ? (
          <>
            <div className="bg-muted flex flex-col gap-3 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium capitalize">
                  {dayLabel(next)}
                  <span className="text-muted-foreground">
                    {' '}
                    · {dateLabel(next)}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-sm tabular-nums">
                  <Clock className="text-muted-foreground size-4" />
                  {next.time}
                </span>
              </div>
              <Location
                locationName={next.locationName}
                className="text-lg font-semibold"
              />
              {next.role && (
                <p className="text-muted-foreground text-sm">{next.role}</p>
              )}
            </div>
            {rest.length > 0 && (
              <ul className="flex flex-col">
                {rest.map((shift, index) => (
                  <li
                    key={shift.date.toISODate()}
                    className={cn(
                      'flex items-center justify-between gap-2 py-2.5',
                      index > 0 && 'border-t',
                    )}>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sm capitalize">
                        {dayLabel(shift)}
                        <span className="text-muted-foreground">
                          {' '}
                          · {dateLabel(shift)}
                        </span>
                      </span>
                      <Location
                        locationName={shift.locationName}
                        className="text-muted-foreground truncate text-xs"
                      />
                    </div>
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {shift.time}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Ближайших смен нет
          </p>
        )}
      </CardContent>
    </Card>
  )
}
