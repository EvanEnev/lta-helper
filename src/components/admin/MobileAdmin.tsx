import {
  Accordion,
  AccordionItem,
  Button,
  CalendarDate,
  DatePicker,
  Selection,
} from '@heroui/react'
import WorkData from './WorkData'
import {useCallback, useEffect, useState} from 'react'
import {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  LTRank,
  LTWorker,
  LTWorkType,
  WorkerSalary,
} from '@/src/utils/types'
import {MinusCircle, Plain, RestartCircle} from 'solar-icon-set'
import {DateTime} from 'luxon'
import {today} from '@internationalized/date'
import convertTZ from '@/lib/functions/convertTZ'
import {useAuth} from '@/src/components/global/providers/authProvider'

interface MobileAdminProps {
  faceId: LTFaceIdData[]
  days: {
    current: DateTime
    previous: DateTime
    today: DateTime
  }
  setDate: any
  locations: LTLocation[]
  salaryData: WorkerSalary[]
  setSalaryData: any
  workers: LTWorker[]
  sendData: any
  isLoading: boolean
  canEdit: boolean
  ranks: LTRank[]
  workTypes: LTWorkType[]
  gamesPayments: LTGamePayment[]
}

export default function MobileAdmin({
  faceId,
  days,
  setDate,
  locations,
  salaryData,
  setSalaryData,
  workers,
  sendData,
  isLoading,
  canEdit,
  ranks,
  workTypes,
  gamesPayments,
}: MobileAdminProps) {
  const {setExiting, worker} = useAuth()
  const [key, setKey] = useState(0)
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['0']))

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

  const addSalaryData = () => {
    setSalaryData((prev: WorkerSalary[]) => [
      ...prev,
      {
        worker: '',
        workingHours: '',
        location: '',
        bonuses: '',
        comment: '',
        isHardTime: false,
        gamesCount: 1,
      },
    ])

    setKey(key + 1)
    setSelectedKeys(new Set([salaryData.length.toString()]))
  }

  const removeSalaryData = (index: number) => {
    const data = salaryData[index]

    setSalaryData((prev: WorkerSalary[]) =>
      data.deleted
        ? prev.map((data, dataIndex) =>
            dataIndex === index ? {...data, deleted: false} : data,
          )
        : prev.map((data, dataIndex) =>
            dataIndex === index ? {...data, deleted: true} : data,
          ),
    )
  }

  useEffect(() => {
    setExiting(false)
  }, [setExiting])

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-4 p-4">
      <div className="flex gap-4">
        <DatePicker
          isInvalid={isDateInvalid}
          errorMessage="Дата вне диапазона"
          isDateUnavailable={date =>
            date.compare(today('Europe/Moscow').subtract({days: 1})) === 0 &&
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
      </div>

      <Accordion
        variant="splitted"
        className="p-0"
        key={key}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}>
        {salaryData?.map((data, index) => {
          const title = `${index + 1}. ${
            [data.worker, data.location, data.workingHours]
              .filter(v => !!v)
              .join(', ') || 'Не заполнено'
          }`

          return (
            <AccordionItem
              title={title}
              key={index}
              className={`pb-2 ${data.deleted ? 'bg-danger/50' : ''}`}
              startContent={
                <Button
                  isIconOnly
                  color="danger"
                  variant="ghost"
                  onPress={() => removeSalaryData(index)}>
                  {data.deleted ? (
                    <RestartCircle size={24} />
                  ) : (
                    <MinusCircle size={24} />
                  )}
                </Button>
              }>
              <WorkData
                faceId={faceId}
                gamesPayments={gamesPayments}
                workTypes={workTypes}
                ranks={ranks}
                locations={locations}
                data={data}
                setData={setSalaryData}
                workers={workers}
                worker={worker}
                index={index}
              />
            </AccordionItem>
          )
        })}
      </Accordion>

      <Button
        size="lg"
        color="default"
        className="h-16 w-full"
        onPress={addSalaryData}>
        Добавить
      </Button>
      <Button
        isDisabled={isDateInvalid}
        size="lg"
        color="primary"
        className="h-16 w-full"
        onPress={sendData}
        endContent={<Plain size={24} />}
        isLoading={isLoading}>
        Отправить
      </Button>
    </main>
  )
}
