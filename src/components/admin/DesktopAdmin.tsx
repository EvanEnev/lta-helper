import {WorkerSalary} from '@/src/utils/types'
import {Button, Card, CardBody, CardHeader, semanticColors} from '@heroui/react'
import WorkData from './WorkData'
import {AddCircle, MinusCircle, Plain} from 'solar-icon-set'
import DayButton from '../schedule/DayButton'

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
    <main className="flex min-h-screen gap-4 p-4">
      <div className="grid h-[95vh] w-full grid-flow-row auto-rows-min grid-cols-3 gap-4 overflow-auto lg:grid-cols-4">
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
        <Card className="h-fit w-[22vw]" isBlurred>
          <CardBody className="gap-4">
            <DayButton
              onclick={() => setDate(days.previous)}
              day={{date: days.previous}}
              color="warning"
              className="h-16 w-full"
              isSelected={
                date.toFormat('yyyy-dd-MM') ===
                days.previous.toFormat('yyyy-dd-MM')
              }
              disabled={days.today.getHours() > 3}
            />
            <DayButton
              onclick={() => setDate(days.current)}
              day={{date: days.current}}
              color="success"
              className="h-16 w-full"
              isSelected={
                date.toFormat('yyyy-dd-MM') ===
                days.current.toFormat('yyyy-dd-MM')
              }
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
