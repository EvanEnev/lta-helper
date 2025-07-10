import {SalaryData} from '@/src/utils/types'
import {Divider, Input, TimeInput, Tooltip} from '@heroui/react'
import {useMemo} from 'react'
import CellChip from '@/src/components/salary/CellChip'
import {DateTime} from 'luxon'
import {Ruble} from 'solar-icon-set'
import LocationIcon from '@/src/components/global/LocationIcon'

export default function CellHeader({data}: {data: SalaryData}) {
  const time = useMemo(() => {
    const startTime = data.start_time.slice(0, -3)
    const endTime = data.end_time.slice(0, -3)

    return {
      start: {
        hour: startTime.split(':')[0],
        minute: startTime.split(':')[1],
      },
      end: {
        hour: endTime.split(':')[0],
        minute: endTime.split(':')[1],
      },
    }
  }, [data.start_time, data.end_time])

  const overWorkTime = useMemo(() => {
    if (!(data.overwork_start && data.overwork_end)) {
      return {}
    }

    const startTime =
      data.overwork_start === '--' ? '--' : data.overwork_start.slice(0, -3)
    const endTime =
      data.overwork_end === '--' ? '--' : data.overwork_end.slice(0, -3)

    return {
      start: {
        hour: startTime.split(':')[0],
        minute: startTime.split(':')[1],
      },
      end: {
        hour: endTime.split(':')[0],
        minute: endTime.split(':')[1],
      },
    }
  }, [data.overwork_start, data.overwork_end])

  const date = useMemo(
    () => DateTime.fromISO(data.created_at),
    [data.created_at],
  )

  return (
    <>
      <div className={`col-span-2 flex items-center justify-center gap-1`}>
        <Tooltip
          content={
            <p className="text-xs">
              {data.created_by} {date.toFormat('dd.MM yyyy')}
            </p>
          }>
          <div className="flex items-center gap-2">
            <LocationIcon locationName={data.location.name} />
            <p>{data.location.name}</p>
          </div>
        </Tooltip>
      </div>
      <TimeInput
        aria-label="Начало смены"
        // @ts-ignore
        value={time.start}
        isReadOnly
      />
      <TimeInput
        aria-label="Конец смены"
        // @ts-ignore
        value={time.end}
        isReadOnly
      />
      <CellChip className="text-foreground text-small col-span-2 flex justify-between">
        {data.value.toString()} <Ruble />
      </CellChip>
      <Divider className="col-span-2 w-full" />
      <p className="col-span-2 text-xs">Переработка</p>
      {/*// @ts-ignore*/}
      <TimeInput
        aria-label="Начало переработки"
        isReadOnly
        // @ts-ignore
        value={overWorkTime.start}
      />
      {/*// @ts-ignore*/}
      <TimeInput
        aria-label="Конец переработки"
        isReadOnly
        // @ts-ignore
        value={overWorkTime.end}
      />
      <CellChip className="text-foreground text-small col-span-2 flex justify-between">
        {data.overwork?.toString() || ''} <Ruble />
      </CellChip>
      <CellChip>Бонусы</CellChip>
      <Input
        aria-label="Бонусы"
        className="col-2 w-fit justify-self-end text-end"
        isReadOnly
        value={data.bonuses || ''}
      />
      <CellChip>Штрафы</CellChip>
      <Input
        aria-label="Штрафы"
        className="col-2 w-fit justify-self-end text-end"
        isReadOnly
        value={data.fines || ''}
      />
    </>
  )
}
