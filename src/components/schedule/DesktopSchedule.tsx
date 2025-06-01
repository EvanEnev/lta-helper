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
import {useAtom} from 'jotai'
import {selectedDatesAtom} from '@/src/utils/global/atoms'
import {DateTime} from 'luxon'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function DesktopSchedule() {
  const {workingDays: days} = useAuth()
  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom)
  const [initialDays, setInitialDays] = useState(days)

  const changeDates = (date: DateTime | undefined, isSelected: boolean) => {
    if (!date) return

    if (isSelected) {
      setSelectedDates([...selectedDates, date])
    } else {
      setSelectedDates(
        selectedDates.filter(
          cur => cur.toFormat('YYYY-MM-dd') !== date.toFormat('YYYY-MM-dd'),
        ),
      )
    }
  }

  const getWeekday = (day: Day): string => {
    return day.date?.toFormat('EEEE', {locale: 'ru-RU'}) || ''
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
    <div className="flex w-full gap-4 px-6">
      {days.length ? (
        <div className="h-[80vh] overflow-auto">
          <div className="grid w-full grid-flow-row auto-rows-min grid-cols-3 gap-4 lg:grid-cols-4">
            {weeks[0].map((day: Day, index: number) => (
              <Card key={index} className="scrollbar-hide overflow-hidden">
                <CardHeader className="">
                  <Checkbox
                    className=""
                    size="lg"
                    onValueChange={isSelected =>
                      changeDates(day.date, isSelected)
                    }>
                    <span className="text-2xl font-bold">
                      {day.date?.toFormat('dd.MM')}
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
          <div className="grid w-full grid-flow-row auto-rows-min grid-cols-3 gap-4 lg:grid-cols-4">
            {weeks[1].map((day: Day, index: number) => (
              <Card key={index} className="scrollbar-hide overflow-hidden">
                <CardHeader className="w-full">
                  <Checkbox
                    className="w-full"
                    size="lg"
                    onValueChange={isSelected =>
                      changeDates(day.date, isSelected)
                    }>
                    <span className="w-full text-2xl font-bold">
                      {day.date?.toFormat('dd.MM')}
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
        <Card className="h-full w-[22vw]" isBlurred>
          <CardHeader className="flex gap-2 text-2xl">
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
    </div>
  )
}
