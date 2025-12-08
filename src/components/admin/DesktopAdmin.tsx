import {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  LTRank,
  LTWorker,
  LTWorkType,
  WorkerSalary,
} from '@/src/utils/types'
import {CalendarDate, DatePicker, semanticColors} from '@heroui/react'
import {Button, Card} from '@heroui/react-beta'
import WorkData from './WorkData'
import {
  AddCircle,
  CheckCircle,
  Eye,
  MinusCircle,
  Plain,
  RestartCircle,
} from 'solar-icon-set'
import {DateTime} from 'luxon'
import {today} from '@internationalized/date'
import {useCallback, useState} from 'react'
import convertTZ from '@/lib/functions/convertTZ'
import {useAuth} from '@/src/components/global/providers/authProvider'
import isDark from '@/lib/functions/isDark'
import {useTheme} from 'next-themes'

interface DesktopAdminProps {
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

export default function DesktopAdmin({
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
}: DesktopAdminProps) {
  const {worker} = useAuth()
  const {theme = 'dark'} = useTheme()
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
      <div className="flex h-full w-full flex-wrap gap-2 overflow-auto">
        {salaryData.map((data, index) => {
          const location = locations.find(l => l.name === data.location)

          const textColorClass =
            theme === 'dark'
              ? isDark(location?.color || '#000000')
                ? 'text-default-100'
                : 'text-foreground'
              : isDark(location?.color || '#ffffff')
                ? 'text-foreground'
                : 'text-default-100'

          return (
            <Card
              key={index}
              className={data.deleted ? 'bg-danger/50 min-w-fit' : 'min-w-fit'}>
              <Card.Header
                className="flex-col items-start justify-center gap-2 rounded-2xl p-2"
                style={{
                  backgroundColor: location?.color || '',
                  transition: 'background-color 0.3s ease-in-out',
                }}>
                <div className="flex w-full shrink-0 items-center justify-start gap-2">
                  <p className={textColorClass}>{index + 1}.</p>
                  <Button
                    variant="tertiary"
                    onPress={() =>
                      setSalaryData((prev: WorkerSalary[]) =>
                        data.deleted
                          ? prev.map((data, dataIndex) =>
                              dataIndex === index
                                ? {...data, deleted: false}
                                : data,
                            )
                          : prev.map((data, dataIndex) =>
                              dataIndex === index
                                ? {...data, deleted: true}
                                : data,
                            ),
                      )
                    }
                    className="w-full flex-1">
                    {data.deleted ? (
                      <RestartCircle
                        //@ts-ignore
                        color={semanticColors.dark.success.DEFAULT}
                        size={24}
                      />
                    ) : (
                      <MinusCircle
                        //@ts-ignore
                        color={semanticColors.dark.danger.DEFAULT}
                        size={24}
                      />
                    )}
                    {data.deleted ? 'Вернуть' : 'Удалить'}
                  </Button>
                  {data.deleted && (
                    <Button
                      className="w-fit flex-1"
                      variant="tertiary"
                      onPress={() =>
                        setSalaryData((prev: WorkerSalary[]) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }>
                      <Eye size={24} />
                      Скрыть
                    </Button>
                  )}
                </div>
                <div
                  className="text-small flex items-center gap-2"
                  style={{visibility: data.createdAt ? undefined : 'hidden'}}>
                  <CheckCircle
                    iconStyle="Bold"
                    // @ts-ignore
                    color={semanticColors[theme].success.DEFAULT}
                    size={20}
                  />
                  <p>{data.createdAt || 'a'}</p>
                </div>
              </Card.Header>
              <Card.Content>
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
              </Card.Content>
            </Card>
          )
        })}
        <Card
          onClick={() =>
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
          }
          className="border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 w-[300px] border-2 border-dashed bg-transparent transition-colors duration-300 ease-in-out hover:cursor-pointer">
          <Card.Content className="flex h-full w-full items-center justify-center border-0">
            <AddCircle size={48} />
          </Card.Content>
        </Card>
      </div>
      <Card className="sticky top-2 z-1000 h-fit w-[22vw]">
        <Card.Content className="gap-4">
          <DatePicker
            variant="bordered"
            aria-label="Дата"
            isInvalid={isDateInvalid}
            errorMessage="Дата вне диапазона"
            isDateUnavailable={date =>
              date.compare(today('Europe/Moscow').subtract({days: 1})) === 0 &&
              days.today.hour > 3 &&
              !canEdit
            }
            selectorButtonPlacement="start"
            firstDayOfWeek="mon"
            className="h-16 w-full p-0!"
            classNames={{inputWrapper: 'h-16'}}
            // @ts-ignore
            onChange={(date: CalendarDate) => updateDate(date)}
            minValue={
              canEdit ? null : today('Europe/Moscow').subtract({days: 1})
            }
            maxValue={canEdit ? null : today('Europe/Moscow')}
            // @ts-ignore
            defaultValue={today('Europe/Moscow')}
          />
          <Button
            className="h-14 w-full py-2"
            size="lg"
            variant="tertiary"
            isIconOnly
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
            <AddCircle size={24} />
            Добавить
          </Button>
          <Button
            isDisabled={isDateInvalid}
            size="lg"
            variant="primary"
            className="h-16 w-full"
            onPress={sendData}
            isPending={isLoading}>
            <Plain size={24} />
            Отправить
          </Button>
        </Card.Content>
      </Card>
    </main>
  )
}
