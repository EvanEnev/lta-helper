import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Code,
  Divider,
} from '@heroui/react'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import {Day} from '@/src/utils/types'
import {useEffect, useMemo, useState} from 'react'
import {Pen2} from 'solar-icon-set'
import {useAtom, useAtomValue} from 'jotai'
import {daysAtom, selectedDatesAtom} from '@/src/utils/global/atoms'

export default function DesktopSchedule() {
  const days = useAtomValue(daysAtom)
  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom)
  const [initialDays, setInitialDays] = useState(days)

  const changeDates = (date: Date | undefined, isSelected: boolean) => {
    if (!date) return

    if (isSelected) {
      setSelectedDates([...selectedDates, date])
    } else {
      setSelectedDates(
        selectedDates.filter(cur => cur.getTime() !== date.getTime()),
      )
    }
  }

  const getWeekday = (day: Day): string => {
    return (
      day.date?.toLocaleDateString('ru-RU', {
        weekday: 'long',
      }) || ''
    )
  }

  const weeks = useMemo(() => {
    const weeks: Day[][] = [[], []]

    days?.forEach(day => {
      if (!weeks[0].find(day => getWeekday(day) === 'воскресенье')) {
        weeks[0].push(day)
      } else {
        weeks[1].push(day)
      }
    })

    return weeks
  }, [days])

  useEffect(() => {
    if (initialDays.find(obj => obj?.date)) return
    setInitialDays(days)
  }, [days, initialDays])

  return (
    <div className="flex w-full px-6 gap-4">
      {days.length ? (
        <div className="overflow-auto h-[80vh]">
          <div className="w-full grid grid-cols-3 lg:grid-cols-4 auto-rows-min grid-flow-row gap-4">
            {weeks[0].map((day: Day, index: number) => (
              <Card key={index} className="scrollbar-hide overflow-hidden">
                <CardHeader className="">
                  <Checkbox
                    className=""
                    size="lg"
                    onValueChange={isSelected =>
                      changeDates(day.date, isSelected)
                    }>
                    <span className="font-bold text-2xl">
                      {day.date?.toLocaleDateString('ru-RU', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                      ,
                      <br />
                      {getWeekday(day)}
                    </span>
                  </Checkbox>
                </CardHeader>
                <CardBody>
                  <DayInfo day={day} />
                </CardBody>
              </Card>
            ))}
          </div>
          <Divider className="my-4" />
          <div className="w-full grid grid-cols-3 lg:grid-cols-4 auto-rows-min grid-flow-row gap-4">
            {weeks[1].map((day: Day, index: number) => (
              <Card key={index} className="scrollbar-hide overflow-hidden">
                <CardHeader className="w-full">
                  <Checkbox
                    className="w-full"
                    size="lg"
                    onValueChange={isSelected =>
                      changeDates(day.date, isSelected)
                    }>
                    <span className="font-bold text-2xl w-full">
                      {day.date?.toLocaleDateString('ru-RU', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                      ,
                      <br />
                      {getWeekday(day)}
                    </span>
                  </Checkbox>
                </CardHeader>
                <CardBody>
                  <DayInfo day={day} />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <i className="opacity-50">Дат пока нет..</i>
      )}
      <div className="h-[70vh]">
        <Card className="w-[22vw] h-full" isBlurred>
          <CardHeader className="text-2xl flex gap-2">
            <Pen2 size={24} svgProps={{width: 24, height: 24}} />
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
                  day => initialDay.date?.getTime() === day.date?.getTime(),
                )
                if (!day) return ''

                return (
                  <div key={index} className="text-xl flex gap-2">
                    {day.date?.toLocaleDateString('ru-RU', {
                      month: 'numeric',
                      day: 'numeric',
                    })}
                    :
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
                      <div className="flex gap-1 w-full">
                        <Code className="min-h-7" color={'danger'}>
                          {initialDay?.comment}
                        </Code>
                        {'->'}
                        <Code
                          color="success"
                          className="break-all whitespace-normal min-h-7">
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
              days={days.filter(day => {
                const initialDay = initialDays.find(
                  initDay => initDay.date?.getTime() === day.date?.getTime(),
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
    </div>
  )
}
