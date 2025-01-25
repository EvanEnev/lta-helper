import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Code,
  Divider,
} from '@nextui-org/react'
import DayInfo from './DayInfo'
import SendButton from './SendButton'
import daysState from '@/src/state/daysState'
import {Day} from '@/src/utils/types'
import {useRecoilState, useRecoilValue} from 'recoil'
import selectedDatesState from '@/src/state/selectedDatesState'
import {useEffect, useMemo, useState} from 'react'
import {Pen2} from 'solar-icon-set'

export default function DesktopSchedule() {
  const days = useRecoilValue(daysState)
  const [selectedDates, setSelectedDates] = useRecoilState(selectedDatesState)
  const [initialDays, setInitialDays] = useState(days)

  const changeDates = (date: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedDates([...selectedDates, date])
    } else {
      setSelectedDates(selectedDates.filter(cur => cur !== date))
    }
  }

  const getWeekday = (day: Day): string => {
    const dayProps = day.date.split('.')
    const dayProp = parseInt(dayProps[0])
    const monthProp = parseInt(dayProps[1])

    const date: any = new Date()

    date.setDate(dayProp)
    date.setMonth(monthProp - 1)

    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
    })
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
    <div className="flex w-full px-6">
      {days.length ? (
        <div className="w-full flex flex-wrap gap-4 max-w-[75vw] overflow-auto h-[80vh]">
          {weeks[0].map((day: Day, index: number) => (
            <Card
              key={index}
              className="max-w-[23%] scrollbar-hide overflow-hidden">
              <CardHeader className="">
                <Checkbox
                  className=""
                  size="lg"
                  onValueChange={isSelected =>
                    changeDates(day.date, isSelected)
                  }>
                  <span className="font-bold text-2xl">
                    {day.date},
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

          <Divider />

          {weeks[1].map((day: Day, index: number) => (
            <Card
              key={index}
              className="max-w-[23%] scrollbar-hide overflow-hidden">
              <CardHeader className="w-full">
                <Checkbox
                  className="w-full"
                  size="lg"
                  onValueChange={isSelected =>
                    changeDates(day.date, isSelected)
                  }>
                  <span className="font-bold text-2xl w-full">
                    {day.date},
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
      ) : (
        <i className="opacity-50">Дат пока нет..</i>
      )}
      <div className="h-[70vh]">
        <Card className="w-[22vw] h-full" isBlurred>
          <CardHeader className="text-2xl flex gap-2">
            <Pen2 size={24} /> Изменённые дни:
          </CardHeader>
          <CardBody className="gap-4">
            {initialDays
              .filter(
                (initDay, index) =>
                  initDay.value !== days[index]?.value ||
                  initDay.comment !== days[index]?.comment,
              )
              .map((initialDay, index) => {
                const day = days.find(day => initialDay.date === day.date)
                if (!day) return <></>

                return (
                  <div key={index} className="text-xl flex gap-2">
                    {day.date}:
                    {initialDay?.value !== day.value ? (
                      <div className="flex gap-1">
                        <Code color={'danger'}>{initialDay?.value}</Code>
                        {'->'}
                        <Code color="success">{day.value}</Code>
                      </div>
                    ) : (
                      ''
                    )}
                    {initialDay?.comment !== day.comment ? (
                      <div className="flex gap-1 w-full">
                        <Code color={'danger'}>{initialDay?.comment}</Code>
                        {'->'}
                        <Code
                          color="success"
                          className="break-all whitespace-normal">
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
            <SendButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
