import {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  LTRank,
  LTWorker,
  LTWorkType,
  WorkerSalary,
} from '@/src/utils/types'
import {DateValue, semanticColors} from '@heroui/react'
import {Button, Card} from '@heroui/react-beta'
import WorkData from './WorkData'
import {DateTime} from 'luxon'
import isDark from '@/lib/functions/isDark'
import {useTheme} from 'next-themes'
import AdminDatePicker from '@/src/components/admin/AdminDatePicker'
import {Icon} from '@iconify/react'

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
  worker: LTWorker
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
  worker,
}: DesktopAdminProps) {
  const {theme = 'dark'} = useTheme()

  const updateDate = (date: DateValue | null) => {
    if (!date) return

    const datetime = DateTime.fromObject({
      day: date.day,
      month: date.month,
      year: date.year,
    })

    setDate(datetime)
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
                      <Icon
                        //@ts-ignore
                        color={semanticColors.dark.success.DEFAULT}
                        icon="solar:restart-circle-linear"
                        width="24"
                        height="24"
                      />
                    ) : (
                      <Icon
                        // @ts-ignore
                        color={semanticColors.dark.danger.DEFAULT}
                        icon="solar:minus-circle-linear"
                        width="24"
                        height="24"
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
                      <Icon icon="solar:eye-linear" width="24" height="24" />
                      Скрыть
                    </Button>
                  )}
                </div>
                <div
                  className="text-small flex items-center gap-2"
                  style={{visibility: data.createdAt ? undefined : 'hidden'}}>
                  <Icon
                    icon="solar:check-circle-bold"
                    width="20"
                    height="20"
                    // @ts-ignore
                    color={semanticColors[theme].success.DEFAULT}
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
          className="border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 w-75 border-2 border-dashed bg-transparent transition-colors duration-300 ease-in-out hover:cursor-pointer">
          <Card.Content className="flex h-full w-full items-center justify-center border-0">
            <Icon icon="solar:add-circle-linear" width="48" height="48" />
          </Card.Content>
        </Card>
      </div>
      <Card className="sticky top-2 z-1000 h-fit w-[22vw]">
        <Card.Content className="gap-4">
          <AdminDatePicker callback={updateDate} canEdit={canEdit} />
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
            <Icon icon="solar:add-circle-linear" width="24" height="24" />
            Добавить
          </Button>
          <Button
            size="lg"
            variant="primary"
            className="h-16 w-full"
            onPress={sendData}
            isPending={isLoading}>
            <Icon icon="solar:plain-linear" width="24" height="24" />
            Отправить
          </Button>
        </Card.Content>
      </Card>
    </main>
  )
}
