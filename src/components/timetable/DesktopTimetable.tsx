import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from '@nextui-org/react'
import Header from './Header'
import {useMemo, useState} from 'react'
import Row from './Row'

type Options = {
  data: any
  days?: Date[]
}

const valuesMap: {
  [key: string]: {
    value: string
    color:
      | 'success'
      | 'default'
      | 'primary'
      | 'secondary'
      | 'warning'
      | 'danger'
  }
} = {
  '+': {value: 'Могу', color: 'success'},
  '-': {value: 'Не могу', color: 'danger'},
  '+/-': {value: 'Могу с огр-ем', color: 'warning'},
}

type Selection = {
  user: number
  date: Date
}

type Member = {
  name: string
  id: number
  rank: string
  firstName: string
}

export default function DesktopTimetable({data, days}: Options) {
  const [selected, setSelected] = useState<Selection>()

  const workersData = useMemo(() => {
    if (!data) return {members: [], days: []}

    const members: Member[] = data.map((obj: any) => ({
      name: obj.name,
      id: obj.telegram_id,
      rank: obj.rank,
      firstName: obj.first_name,
    }))

    const days = data
      .filter((obj: any) =>
        members.find((member: any) => member.id === obj.telegram_id),
      )
      .map((obj: any) => ({
        days: obj.days,
      }))

    return {members, days}
  }, [data])

  return (
    <div className="flex w-full gap-4 text-xl">
      <div className="relative flex w-full max-w-[15%] flex-col gap-2 rounded-lg bg-content2 p-4">
        <Header children={['Сотрудник']} />
        <Divider />
        {data &&
          workersData.members.map((worker: any) => {
            return (
              <>
                <Tooltip
                  showArrow
                  content={
                    <div className="p-2">
                      {worker.name}, {worker.rank}
                    </div>
                  }>
                  <div className="h-10 max-h-10">
                    <p className="my-auto">{worker.name}</p>
                  </div>
                </Tooltip>
                <Divider className="last:hidden" />
              </>
            )
          })}
      </div>
      <div
        className={`relative flex w-full max-w-full flex-col gap-2 rounded-lg bg-content2 p-4`}>
        <Header
          children={days?.map(day =>
            day.toLocaleDateString('ru-RU', {
              month: 'numeric',
              day: 'numeric',
              weekday: 'short',
            }),
          )}
        />
        <Divider />
        <div
          className={`grid max-w-full grid-flow-row gap-2`}
          style={{
            gridTemplateColumns: `repeat(${(days?.length || 0) * 2}, minmax(0, 1fr))`,
          }}>
          <Row rowNumber={1} className="self-start">
            {days?.map(day => (
              <span>
                {day.toLocaleDateString('ru-RU', {
                  month: 'numeric',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </span>
            ))}
          </Row>
          {data &&
            workersData.days.map((day: any, rowIndex: number) => {
              return (
                <>
                  {days?.map((date: Date, index) => {
                    const data = day.days.find(
                      (obj: any) =>
                        new Date(obj.date).getTime() === date.getTime(),
                    )

                    return (
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            // onMouseEnter={() => setSelected({user: data.id})}
                            color={valuesMap[data?.value]?.color || 'default'}
                            className={`truncate text-center col-start-[${index + 1}] row-start-${rowIndex + 1} h-10 max-h-10`}>
                            {valuesMap[data?.value]?.value || data?.value || ''}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu variant="faded">
                          <DropdownItem key="+">Могу</DropdownItem>
                          <DropdownItem key="-">Не могу</DropdownItem>
                          <DropdownItem key="+/-">Могу с огр-ем</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )
                  })}
                  <Divider
                    style={{gridColumnEnd: days?.length || 1}}
                    className={`col-start-[1]`}
                  />
                </>
              )
            })}
        </div>
      </div>
    </div>
  )
}
