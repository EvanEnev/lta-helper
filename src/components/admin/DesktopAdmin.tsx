import {LTWorker, WorkerSalary} from '@/src/utils/types'
import {
  Button,
  CalendarDate,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  semanticColors,
} from '@heroui/react'
import WorkData from './WorkData'
import {AddCircle, MinusCircle, Plain} from 'solar-icon-set'
import {DateTime, Interval} from 'luxon'
import {today} from '@internationalized/date'
import {useCallback, useEffect, useState} from 'react'
import convertTZ from '@/lib/functions/convertTZ'

type Options = {
  days: {
    current: DateTime
    previous: DateTime
    today: DateTime
  }
  setDate: any
  date: DateTime
  salaryData: WorkerSalary[]
  setSalaryData: any
  workers: LTWorker[]
  sendData: any
  isLoading: boolean
  canEdit: boolean
}

export default function DesktopAdmin({
  days,
  setDate,
  date,
  salaryData,
  setSalaryData,
  workers,
  sendData,
  isLoading,
  canEdit,
}: Options) {
  const [isDateInvalid, setIsDateInvalid] = useState<boolean>(false)

  const checkDateValid = useCallback(
    (date: DateTime) => {
      const now = convertTZ(new Date(), 'Europe/Moscow').set({
        hour: 0,
      })

      let isInvalid = false

      const diff = Math.floor(now.diff(date).as('days'))

      if (!canEdit && diff >= 1) {
        if (date > now) {
          isInvalid = true
        } else if (diff === 1 && date < now && now.hour > 3) {
          isInvalid = true
        } else if (diff >= 2) {
          isInvalid = true
        }
      }

      setIsDateInvalid(isInvalid)
      return isInvalid
    },
    [canEdit],
  )

  const updateDate = (date: CalendarDate) => {
    const datetime = DateTime.fromObject({
      day: date.day,
      month: date.month,
      year: date.year,
    })

    const isInvalid = checkDateValid(datetime)

    if (!isInvalid) {
      setDate(datetime)
    }
  }

  return (
    <main className="flex min-h-full gap-4 p-4">
      <div className="grid h-full w-full grid-flow-row auto-rows-min grid-cols-3 gap-4 overflow-auto lg:grid-cols-4">
        {salaryData.map((data, index) => {
          return (
            <Card key={index} className="">
              <CardHeader className="gap-4">
                {index + 1}.
                <Button
                  variant="faded"
                  size="lg"
                  onPress={() =>
                    setSalaryData(salaryData.filter((_, i) => i !== index))
                  }
                  startContent={
                    <MinusCircle
                      //@ts-ignore
                      color={semanticColors.dark.danger.DEFAULT}
                      size={24}
                    />
                  }
                  className="w-full">
                  Удалить
                </Button>
              </CardHeader>
              <CardBody>
                <WorkData
                  data={data}
                  setData={setSalaryData}
                  workers={workers}
                  index={index}
                />
              </CardBody>
            </Card>
          )
        })}
      </div>
      <div className="h-[70vh]">
        <Card className="h-fit w-[22vw]">
          <CardBody className="gap-4">
            <DatePicker
              isInvalid={isDateInvalid}
              errorMessage="Дата вне диапазона"
              isDateUnavailable={date =>
                date.compare(today('Europe/Moscow').subtract({days: 1})) ===
                  0 &&
                days.today.hour > 3 &&
                !canEdit
              }
              selectorButtonPlacement="start"
              firstDayOfWeek="mon"
              className="h-16 w-full"
              classNames={{inputWrapper: 'h-16'}}
              // @ts-ignore
              onChange={(date: CalendarDate) => updateDate(date)}
              minValue={today('Europe/Moscow').subtract({days: 1})}
              maxValue={today('Europe/Moscow')}
              // @ts-ignore
              defaultValue={today('Europe/Moscow')}
            />
            <Button
              className="h-min p-2"
              onPress={() =>
                setSalaryData((prev: WorkerSalary[]) => [
                  ...prev,
                  {
                    worker: '',
                    workingHours: prev[prev.length - 1]?.workingHours || '',
                    location: prev[prev.length - 1]?.location || '',
                    bonuses: '',
                    comment: '',
                    isHardTime: false,
                    gamesCount: 1,
                  },
                ])
              }>
              <AddCircle size={48} />
            </Button>
            <Button
              isDisabled={isDateInvalid}
              size="lg"
              color="primary"
              className="h-16 w-full"
              onPress={sendData}
              startContent={<Plain size={24} />}
              isLoading={isLoading}>
              Отправить
            </Button>
          </CardBody>
        </Card>
      </div>
    </main>
  )
}
