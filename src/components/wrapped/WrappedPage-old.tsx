import {
  WrappedLocations,
  WrappedSchedule,
  WrappedShifts,
  WrapperWorkers,
} from '@/src/utils/types'
import {Card, Separator} from '@heroui/react-beta'
import RankIcon from '@/src/components/global/RankIcon'
import Location from '@/src/components/global/Location'
import {Fragment, ReactElement} from 'react'
import {AddCircle, MinusCircle, QuestionCircle} from 'solar-icon-set'

interface WrappedPageProps {
  workersData: WrapperWorkers[]
  locationsData: WrappedLocations[]
  shiftsData: WrappedShifts
  scheduleData: WrappedSchedule
}

const scheduleLegend: {
  name: string
  key: keyof WrappedSchedule
  icon: ReactElement
  color?: string
}[] = [
  {
    name: 'Могу',
    key: 'plus',
    icon: <AddCircle iconStyle="Bold" />,
    color: 'bg-success/30',
  },
  {
    name: 'Не могу',
    key: 'minus',
    icon: <MinusCircle iconStyle="Bold" />,
    color: 'bg-danger/30',
  },
  {
    name: 'С ограничением',
    key: 'limitations',
    icon: <QuestionCircle iconStyle="Bold" />,
    color: 'bg-warning/30',
  },
]

export default function WrappedPage({
  workersData,
  locationsData,
  shiftsData,
  scheduleData,
}: WrappedPageProps) {
  return (
    <main className="flex flex-col gap-4 p-4">
      <div className="flex w-full flex-col gap-4 sm:flex-row">
        <Card className="w-full sm:w-[15rem]">
          <Card.Header className="wrap-break-word">Всего смен</Card.Header>
          <Card.Content className="flex flex-col justify-around gap-2">
            {shiftsData.count}
          </Card.Content>
        </Card>
        <Card className="w-full sm:w-[15rem]">
          <Card.Header className="wrap-break-word">Возможности</Card.Header>
          <Card.Content className="flex flex-col justify-around gap-2">
            {scheduleLegend.map((data, index) => (
              <div
                key={index}
                className={`flex justify-between gap-2 ${data.color} rounded-xl p-2`}>
                <div className="flex items-center gap-2">
                  {data.icon}
                  <p>{data.name}</p>
                </div>
                <p>{scheduleData[data.key]}</p>
              </div>
            ))}
          </Card.Content>
        </Card>
      </div>
      <div className="flex w-full flex-col gap-4 sm:flex-row">
        <Card className="w-full sm:w-[15rem]">
          <Card.Header className="wrap-break-word">
            Топ 10 любимых сотрудников
          </Card.Header>
          <Card.Content className="flex flex-col justify-around gap-2">
            <div className="flex items-center justify-around gap-2">
              <p className="text-foreground-500">Позывной</p>
              <p className="text-foreground-500">Пересечений</p>
            </div>
            <Separator />
            {workersData
              .filter((_, i) => i < 10)
              .map((data, index) => (
                <Fragment key={index}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <RankIcon rank={data.rank} />
                      <p>{data.worker}</p>
                    </div>
                    <p>{data.count}</p>
                  </div>
                  {index !==
                    workersData.filter((_, i) => i < 10).length - 1 && (
                    <Separator />
                  )}
                </Fragment>
              ))}
          </Card.Content>
        </Card>
        <Card className="w-full sm:w-[15rem]">
          <Card.Header className="wrap-break-word">
            Топ 10 любимых администраторов
          </Card.Header>
          <Card.Content className="flex flex-col justify-around gap-2">
            <div className="flex items-center justify-around gap-2">
              <p className="text-foreground-500">Позывной</p>
              <p className="text-foreground-500">Пересечений</p>
            </div>
            <Separator />
            {workersData
              .filter(d => ['Платиновый', 'Золотой'].includes(d.rank))
              .filter((_, i) => i < 10)
              .map((data, index) => (
                <Fragment key={index}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <RankIcon rank={data.rank} />
                      <p>{data.worker}</p>
                    </div>
                    <p>{data.count}</p>
                  </div>
                  {index !==
                    workersData
                      .filter(d => ['Платиновый', 'Золотой'].includes(d.rank))
                      .filter((_, i) => i < 10).length -
                      1 && <Separator />}
                </Fragment>
              ))}
          </Card.Content>
        </Card>
        <Card className="w-full sm:w-[15rem]">
          <Card.Header className="wrap-break-word">
            Топ любимых локаций
          </Card.Header>
          <Card.Content className="flex flex-col gap-2">
            <div className="flex items-center justify-around gap-2">
              <p className="text-foreground-500">Название</p>
              <p className="text-foreground-500">Смен</p>
            </div>
            <Separator />
            {locationsData.map((data, index) => (
              <Fragment key={index}>
                <div className="flex items-center justify-between gap-8">
                  <Location locationName={data.location} />
                  <p>{data.count}</p>
                </div>
                {index !== locationsData.length - 1 && <Separator />}
              </Fragment>
            ))}
          </Card.Content>
        </Card>
      </div>
    </main>
  )
}
