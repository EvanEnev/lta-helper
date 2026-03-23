import {Accordion, Button, DateValue, Selection} from '@heroui/react'
import WorkData from './WorkData'
import {useState} from 'react'
import {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  LTRank,
  LTWorker,
  LTWorkType,
  WorkerSalary,
} from '@/src/utils/types'
import {DateTime} from 'luxon'
import AdminDatePicker from '@/src/components/admin/AdminDatePicker'
import {Icon} from '@iconify/react'

interface MobileAdminProps {
  worker: LTWorker
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
  worker,
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
  const [key, setKey] = useState(0)
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['0']))

  const updateDate = (date: DateValue | null) => {
    if (!date) return

    const datetime = DateTime.fromObject({
      day: date.day,
      month: date.month,
      year: date.year,
    })

    setDate(datetime)
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-4 p-4">
      <div className="flex gap-4">
        <AdminDatePicker callback={updateDate} canEdit={canEdit} />
      </div>
      <Accordion variant="surface" className="p-0" key={key}>
        {salaryData?.map((data, index) => {
          const title = `${index + 1}. ${
            [data.worker, data.location, data.workingHours]
              .filter(v => !!v)
              .join(', ') || 'Не заполнено'
          }`

          return (
            <Accordion.Item key={index}>
              <Accordion.Heading
                className={`${data.deleted ? 'bg-danger-soft rounded-3xl' : ''} items-center gap-2`}>
                <Button
                  isIconOnly
                  className="ml-2"
                  variant="danger-soft"
                  onPress={() => removeSalaryData(index)}>
                  {data.deleted ? (
                    <Icon
                      icon="solar:restart-circle-linear"
                      width="24"
                      height="24"
                    />
                  ) : (
                    <Icon
                      icon="solar:minus-circle-linear"
                      width="24"
                      height="24"
                    />
                  )}
                </Button>
                <Accordion.Trigger>
                  {title}
                  <Accordion.Indicator>
                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      width="24"
                      height="24"
                    />
                  </Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="flex justify-center">
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
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          )
        })}
      </Accordion>

      <Button
        size="lg"
        slot="icon"
        variant="tertiary"
        className="h-16 w-full"
        onPress={addSalaryData}>
        <Icon icon="solar:add-circle-linear" width="24" height="24" />
        Добавить
      </Button>
      <Button
        size="lg"
        slot="icon"
        className="h-16 w-full"
        onPress={sendData}
        isPending={isLoading}>
        <Icon icon="solar:plain-linear" width="24" height="24" />
        Отправить
      </Button>
    </main>
  )
}
