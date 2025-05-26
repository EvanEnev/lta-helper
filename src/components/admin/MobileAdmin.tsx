import {Accordion, AccordionItem, Button, Selection} from '@heroui/react'
import DayButton from '../schedule/DayButton'
import WorkData from './WorkData'
import {useState} from 'react'
import {WorkerSalary} from '@/src/utils/types'
import {Plain} from 'solar-icon-set'

type Options = {
  days: {
    current: any
    previous: any
    today: any
  }
  setDate: any
  date?: any
  salaryData: WorkerSalary[]
  setSalaryData: any
  workers: string[]
  sendData: any
  isLoading: boolean
}

export default function MobileAdmin({
  days,
  setDate,
  date,
  salaryData,
  setSalaryData,
  workers,
  sendData,
  isLoading,
}: Options) {
  const [key, setKey] = useState(0)
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['0']))

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
    setSalaryData((prev: WorkerSalary[]) => prev.filter((_, i) => i !== index))
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-4 p-4">
      <div className="flex gap-4">
        <DayButton
          onclick={() => setDate(days.previous)}
          day={{date: days.previous}}
          color="warning"
          isSelected={date?.getTime() === days.previous.getTime()}
          disabled={days.today.getHours() > 3}
        />
        <DayButton
          onclick={() => setDate(days.current)}
          day={{date: days.current}}
          color="success"
          isSelected={
            date.toFormat('yyyy-dd-MM') === days.current.toFormat('yyyy-dd-MM')
          }
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
              className="pb-2"
              startContent={
                <Button
                  isIconOnly
                  color="danger"
                  variant="ghost"
                  onPress={() => removeSalaryData(index)}>
                  X
                </Button>
              }>
              <WorkData
                data={data}
                setData={setSalaryData}
                workers={workers}
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
