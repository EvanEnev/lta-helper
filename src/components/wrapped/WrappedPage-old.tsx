import {
  WrappedDeals,
  WrappedDealsType,
  WrappedLocations,
  WrappedSchedule,
  WrappedShifts,
  WrapperWorkers,
} from '@/src/utils/types'
import {Card, Separator} from '@heroui/react-beta'
import RankIcon from '@/src/components/global/RankIcon'
import Location from '@/src/components/global/Location'
import {Fragment, ReactElement} from 'react'
import {Icon} from '@iconify/react'

interface WrappedPageProps {
  workersData: WrapperWorkers[]
  locationsData: WrappedLocations[]
  shiftsData: WrappedShifts
  scheduleData: WrappedSchedule
  dealsData: WrappedDeals
  dealsGamesTypes: WrappedDealsType[]
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
    icon: <Icon icon="solar:add-circle-bold" width="24" height="24" />,
    color: 'bg-success/30',
  },
  {
    name: 'Не могу',
    key: 'minus',
    icon: <Icon icon="solar:minus-circle-bold" width="24" height="24" />,
    color: 'bg-danger/30',
  },
  {
    name: 'С ограничением',
    key: 'limitations',
    icon: <Icon icon="solar:question-circle-bold" width="24" height="24" />,
    color: 'bg-warning/30',
  },
]

export default function WrappedPage({
  workersData,
  locationsData,
  shiftsData,
  scheduleData,
  dealsData,
  dealsGamesTypes,
}: WrappedPageProps) {
  return (
    <main className="flex flex-col gap-4 p-4">
      <div className="flex w-full flex-col gap-4 sm:flex-row">
        <Card className="w-full sm:w-[15rem]">
          <Card.Header
            style={{visibility: 'hidden'}}
            className="wrap-break-word">
            1
          </Card.Header>
          <Card.Content className="flex flex-col justify-around gap-2">
            <div
              className={`bg-content2 flex justify-between gap-2 rounded-xl p-2`}>
              <div className="flex items-center gap-2">
                <p>Всего смен</p>
              </div>
              <p>{shiftsData.count}</p>
            </div>
            <div
              className={`bg-content2 flex justify-between gap-2 rounded-xl p-2`}>
              <div className="flex items-center gap-2">
                <p>Игр инструктором</p>
              </div>
              <p>{dealsData.worker}</p>
            </div>
            <div
              className={`bg-content2 flex justify-between gap-2 rounded-xl p-2`}>
              <div className="flex items-center gap-2">
                <p>Игр актёром</p>
              </div>
              <p>{dealsData.actor}</p>
            </div>
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
        <Card className="w-full sm:w-[15rem]">
          <Card.Header className="wrap-break-word">Игры</Card.Header>
          <Card.Content className="flex flex-col justify-around gap-2">
            <div
              className={`bg-content2 flex justify-between gap-2 rounded-xl p-2`}>
              <div className="flex items-center gap-2">
                <p>Всего</p>
              </div>
              <p>{dealsData.count}</p>
            </div>
            <div
              className={`bg-content2 flex justify-between gap-2 rounded-xl p-2`}>
              <div className="flex items-center gap-2">
                <p>ЛТ</p>
              </div>
              <p>
                {dealsGamesTypes.find(d => d.name === 'Классический – ЛТ')
                  ?.count || 0}
              </p>
            </div>
            <div
              className={`bg-content2 flex justify-between gap-2 rounded-xl p-2`}>
              <div className="flex items-center gap-2">
                <p>Сюжетные</p>
              </div>
              <p>
                {dealsGamesTypes
                  .filter(d => d.name !== 'Классический – ЛТ')
                  .reduce((acc, cur) => acc + Number(cur.count), 0) || 0}
              </p>
            </div>
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
        <Card className="w-full sm:w-[15rem]">
          <Card.Header className="wrap-break-word">
            Топ любимых программ
          </Card.Header>
          <Card.Content className="flex flex-col gap-2">
            <div className="flex items-center justify-around gap-2">
              <p className="text-foreground-500">Название</p>
              <p className="text-foreground-500">Проведено</p>
            </div>
            <Separator />
            {dealsGamesTypes.map((data, index) => (
              <Fragment key={index}>
                <div className="flex items-center justify-between gap-8">
                  <p>{data.name}</p>
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
