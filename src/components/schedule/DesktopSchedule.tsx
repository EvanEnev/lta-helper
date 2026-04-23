import {Card, Checkbox, Separator} from '@heroui/react'
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
              {index !== 0 && <Separator className="col-span-full" />}
              {week.map((day, index) => (
                <div key={index} className="rounded-2xl">
                  <AnimatedBorder
                    isDisabled={
                      today.toFormat('yyyy-MM-dd') !==
                      day.date?.toFormat('yyyy-MM-dd')
                    }>
                    <Card className={`scrollbar-hide h-full overflow-hidden`}>
                      <Card.Header className="w-full">
                        <Checkbox
                          className="w-full"
                          isSelected={
                            !!selectedDates.find(
                              date =>
                                date.toFormat('yyyy-MM-dd') ===
                                day.date?.toFormat('yyyy-MM-dd'),
                            )
                          }
                          onChange={isSelected =>
                            changeDates(day.date, isSelected)
                          }>
                          <span className="text-2xl font-bold">
                            {day.date?.toFormat('dd.MM, EEE', {
                              locale: 'ru-RU',
                            })}
                          </span>
                        </Checkbox>
                      </Card.Header>
                      <Card.Content>
                        <DayInfo
                          worker={worker}
                          day={day}
                          changeDates={changeDates}
                        />
                      </Card.Content>
                    </Card>
                  </AnimatedBorder>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      ) : (
        <i className="opacity-50">Дат пока нет..</i>
      )}
      <Card className="glass sticky top-2 h-fit min-h-64 min-w-[20%]">
        <Card.Header className="flex flex-row gap-2 text-2xl">
          <Icon icon="solar:pen-2-linear" width="24" height="24" />
          <p>Изменённые дни:</p>
        </Card.Header>
        <Card.Content className="gap-4">
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

              let initialColor = ''

              switch (initialDay?.value) {
                case '+':
                  initialColor = 'text-success'
                  break
                case '-':
                  initialColor = 'text-danger'
                  break
                case '+/-':
                  initialColor = 'text-warning'
                  break
              }

              let newColor = ''

              switch (day?.value) {
                case '+':
                  newColor = 'text-success'
                  break
                case '-':
                  newColor = 'text-danger'
                  break
                case '+/-':
                  newColor = 'text-warning'
                  break
              }

              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-center text-xl">
                    <p className="underline">{day.date?.toFormat('dd.MM')}</p>
                    {initialDay?.value !== day.value ? (
                      <>
                        {initialDay?.value ? (
                          <>
                            <p className={`${initialColor} min-h-7`}>
                              {initialDay?.value}
                            </p>
                            <Icon
                              icon="solar:arrow-right-linear"
                              width="24"
                              height="24"
                            />
                          </>
                        ) : (
                          ''
                        )}

                        <p
                          className={`${newColor} min-h-7 break-all whitespace-normal`}>
                          {day.value}
                        </p>
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xl">
                    {initialDay?.comment !== day.comment ? (
                      <>
                        <p className="underline">
                          {day.date?.toFormat('dd.MM')}
                        </p>

                        {initialDay?.comment ? (
                          <>
                            <p className="min-h-7">{initialDay?.comment}</p>
                            <Icon
                              icon="solar:arrow-right-linear"
                              width="24"
                              height="24"
                            />
                          </>
                        ) : (
                          ''
                        )}

                        <p className="min-h-7 break-all whitespace-normal">
                          {day.comment}
                        </p>
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              )
            })}
        </Card.Content>
        <Card.Footer>
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
        </Card.Footer>
      </Card>
    </div>
  )
}
