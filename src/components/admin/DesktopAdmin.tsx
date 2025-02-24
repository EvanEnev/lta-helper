import {WorkerSalary} from '@/src/utils/types'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  colors,
  semanticColors,
} from '@heroui/react'
import WorkData from './WorkData'
import {AddCircle, MinusCircle, MinusSquare, Pen2, Plain} from 'solar-icon-set'
import DayButton from '../schedule/DayButton'

type Options = {
  days: {
    current: Date
    previous: Date
    today: Date
  }
  setDate: any
  date?: Date
  salaryData: WorkerSalary[]
  setSalaryData: any
  workers: string[]
  sendData: any
  isLoading: boolean
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
}: Options) {
  return (
    <main className="flex gap-4 min-h-screen p-4">
      <div className="grid grid-cols-3 lg:grid-cols-4 auto-rows-min grid-flow-row gap-4 w-full overflow-auto h-[95vh]">
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
        <Card className="w-[22vw] h-fit" isBlurred>
          <CardBody className="gap-4">
            <DayButton
              onclick={() => setDate(days.previous)}
              day={{date: days.previous}}
              color="warning"
              className="w-full h-16"
              isSelected={date?.getTime() === days.previous.getTime()}
              disabled={days.today.getHours() > 3}
            />
            <DayButton
              onclick={() => setDate(days.current)}
              day={{date: days.current}}
              color="success"
              className="w-full h-16"
              isSelected={date?.getTime() === days.current.getTime()}
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
              size="lg"
              color="primary"
              className="w-full h-16"
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
