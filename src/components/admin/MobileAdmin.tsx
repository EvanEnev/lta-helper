import {
  Accordion,
  AccordionItem,
  Button,
  DateValue,
  Selection,
} from '@heroui/react'
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
import {MinusCircle, Plain, RestartCircle} from 'solar-icon-set'
import {DateTime} from 'luxon'
import AdminDatePicker from '@/src/components/admin/AdminDatePicker'

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
