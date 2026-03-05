import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Code,
  Divider,
  Skeleton,
} from '@heroui/react'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import {Day, LTWorker} from '@/src/utils/types'
import {Fragment, useEffect, useMemo, useState} from 'react'
import {useAtom} from 'jotai'
import {daysAtom, selectedDatesAtom} from '@/src/utils/global/atoms'
import {DateTime} from 'luxon'
import AnimatedBorder from '@/src/components/global/AnimatedBorder'
import {Icon} from '@iconify/react'

interface DesktopScheduleProps {
  worker: LTWorker
  workingDays: Day[]
}

export default function DesktopSchedule({
  worker,
  workingDays,
}: DesktopScheduleProps) {
  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom)
  const [initialDays, setInitialDays] = useState(workingDays)
  const [days, setDays] = useAtom(daysAtom)

  const changeDates = (date: DateTime | undefined, isSelected: boolean) => {
    if (!date) return

    if (isSelected) {
      setSelectedDates([...selectedDates, date])
    } else {
      setSelectedDates(
        selectedDates.filter(
          cur => cur.toFormat('yyyy-MM-dd') === date.toFormat('yyyy-MM-dd'),
        ),
      )
    }
  }

  const getWeekday = (day: Day): string => {
    if (!day.date) return ''
    return day.date.toFormat('EEEE', {locale: 'ru-RU'}) || ''
  }

  const weeks = useMemo(() => {
    const weeks: Day[][] = [[], []]

    let index = 0

    days.forEach(day => {
      if (!weeks[index]) weeks[index] = []

      weeks[index].push(day)

      if (getWeekday(day) === 'воскресенье') {
        index++
      }
    })

    return weeks
  }, [days])

  useEffect(() => {
    setDays(workingDays)
  }, [workingDays, setDays])

  useEffect(() => {
    if (initialDays.find(obj => obj?.date)) return
    setInitialDays(days)
  }, [days, initialDays])

  const today = DateTime.now()

  return (
    <div className="flex w-full max-w-full gap-4 px-6">
      {days.length ? (
        <div className="grid w-full grid-flow-row auto-rows-min grid-cols-3 gap-4 lg:grid-cols-4">
          {weeks.map((week: Day[], index: number) => (
            <Fragment key={index}>
              {index !== 0 && <Divider className="col-span-full" />}
              {week.map((day, index) => (
                <Skeleton
                  isLoaded={!!day.date}
                  key={index}
                  className="rounded-2xl">
                  <AnimatedBorder
                    isDisabled={
                      today.toFormat('yyyy-MM-dd') !==
                      day.date?.toFormat('yyyy-MM-dd')
                    }>
                    <Card className={`scrollbar-hide h-full overflow-hidden`}>
                      <CardHeader className="w-full">
                        <Checkbox
                          className="w-full"
                          size="lg"
                          isSelected={
                            !!selectedDates.find(
                              date =>
                                date.toFormat('yyyy-MM-dd') ===
                                day.date?.toFormat('yyyy-MM-dd'),
                            )
                          }
                          onValueChange={isSelected =>
                            changeDates(day.date, isSelected)
                          }>
                          <span className="text-2xl font-bold">
                            {day.date?.toFormat('dd.MM')},{' '}
                            {day.date?.toFormat('EEE', {locale: 'ru-RU'})}
                          </span>
                        </Checkbox>
                      </CardHeader>
                      <CardBody>
                        <DayInfo
                          worker={worker}
                          day={day}
                          changeDates={changeDates}
                        />
                      </CardBody>
                    </Card>
                  </AnimatedBorder>
                </Skeleton>
              ))}
            </Fragment>
          ))}
        </div>
      ) : (
        <i className="opacity-50">Дат пока нет..</i>
      )}
      <Card className="glass sticky top-2 h-fit min-h-64 min-w-[20%]">
        <CardHeader className="flex gap-2 text-2xl">
          <Icon icon="solar:pen-2-linear" width="24" height="24" />
          Изменённые дни:
        </CardHeader>
        <CardBody className="gap-4">
          {initialDays
            .filter(
              (initDay, index) =>
                initDay.value !== days[index]?.value ||
                initDay.comment !== days[index]?.comment,
            )
            .map((initialDay, index) => {
              const day = days.find(
                day =>
                  initialDay.date?.toFormat('YYYY-MM-dd') ===
                  day.date?.toFormat('YYYY-MM-dd'),
              )
              if (!day) return ''

              return (
                <div key={index} className="flex gap-2 text-xl">
                  {day.date?.toFormat('dd.MM')}:
                  {initialDay?.value !== day.value ? (
                    <div className="flex gap-1">
                      <Code className="min-h-7 min-w-6" color={'danger'}>
                        {initialDay?.value}
                      </Code>
                      {'->'}
                      <Code className="min-h-7 min-w-6" color="success">
                        {day.value}
                      </Code>
                    </div>
                  ) : (
                    ''
                  )}
                  {initialDay?.comment !== day.comment ? (
                    <div className="flex w-full gap-1">
                      <Code className="min-h-7" color={'danger'}>
                        {initialDay?.comment}
                      </Code>
                      {'->'}
                      <Code
                        color="success"
                        className="min-h-7 break-all whitespace-normal">
                        {day.comment}
                      </Code>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              )
            })}
        </CardBody>
        <CardFooter>
          <SendButton
            worker={worker}
            days={days.filter(day => {
              const initialDay = initialDays.find(
                initDay =>
                  initDay.date?.toFormat('YYYY-MM-dd') ===
                  day.date?.toFormat('YYYY-MM-dd'),
              )
              return (
                day.value !== initialDay?.value ||
                day.comment !== initialDay?.comment
              )
            })}
          />
        </CardFooter>
      </Card>
    </div>
  )
}
