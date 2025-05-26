import {SalaryData} from '@/src/utils/types'
import {Divider, Input, TimeInput, Tooltip} from '@heroui/react'
import {useCallback, useMemo} from 'react'
import CellChip from '@/src/components/salary/CellChip'
import {DateTime} from 'luxon'
import {MapPoint, Ruble} from 'solar-icon-set'

export default function CellHeaderEditable({
  data,
  handleEdit,
}: {
  data: SalaryData
  handleEdit: (data: SalaryData) => void
}) {
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
  const workDate = useMemo(() => DateTime.fromISO(data.date), [data.date])

  const update = useCallback(
    (
      value:
        | string
        | {
            hour: number
            minute: number
          },
      type:
        | 'start_time'
        | 'end_time'
        | 'value'
        | 'bonuses'
        | 'fines'
        | 'overwork_start'
        | 'overwork_end'
        | 'overwork',
    ) => {
      const newData: SalaryData = {...data}

      if (
        ['start_time', 'end_time', 'overwork_start', 'overwork_end'].includes(
          type,
        )
      ) {
        value = value as {hour: number; minute: number}

        if (!value) {
          value = 'NULL'
        } else {
          const hours =
            value.hour.toString().length === 1 ? `0${value.hour}` : value.hour
          const minutes =
            value.minute.toString().length === 1
              ? `0${value.minute}`
              : value.minute

          value = `${hours}:${minutes}:00`
        }
      }

      // @ts-ignore
      newData[type] = value

      handleEdit(newData)
    },
    [data, handleEdit],
  )

  return (
    <>
      <div className="col-span-2 flex items-center justify-center gap-1 mix-blend-difference">
        <MapPoint iconStyle="Bold" />
        <Tooltip
          content={
            <p className="text-xs mix-blend-difference">
              {data.created_by} {date.toFormat('dd.MM yyyy')}
            </p>
          }>
          <p>{data.location.name}</p>
        </Tooltip>
      </div>

      <Divider className="bg-default-100 col-span-2 w-full" />
      <p className="text-default-100 col-span-2 text-xs">
        Смена {workDate.toFormat('dd.MM')}
      </p>
      <TimeInput
        // @ts-ignore
        value={time.start}
        // @ts-ignore
        onChange={value => update(value, 'start_time')}
      />
      <TimeInput
        // @ts-ignore
        value={time.end}
        // @ts-ignore
        onChange={value => update(value, 'end_time')}
      />
      <Input
        className="col-span-2"
        value={data.value.toString()}
        onValueChange={value => update(value, 'value')}
        endContent={<Ruble />}></Input>
      <Divider className="bg-default-100 col-span-2 w-full" />
      <p className="text-default-100 col-span-2 text-xs">Переработка</p>
      {/*// @ts-ignore*/}
      <TimeInput
        className=""
        // @ts-ignore
        value={overWorkTime.start}
        // @ts-ignore
        onChange={value => update(value, 'overwork_start')}
      />
      {/*// @ts-ignore*/}
      <TimeInput
        className=""
        // @ts-ignore
        value={overWorkTime.end}
        // @ts-ignore
        onChange={value => update(value, 'overwork_end')}
      />
      <Input
        className="col-span-2 w-fit justify-self-end text-end text-xs"
        value={data.overwork?.toString() || ''}
        onValueChange={value => update(value, 'overwork')}
        endContent={<Ruble />}></Input>
      <CellChip>Бонусы</CellChip>
      <Input
        className="col-2 w-fit justify-self-end text-end"
        onValueChange={value => update(value, 'bonuses')}
        value={data.bonuses || ''}
      />
      <CellChip>Штрафы</CellChip>
      <Input
        className="col-2 w-fit justify-self-end text-end"
        onValueChange={value => update(value, 'fines')}
        value={data.fines || ''}
      />
    </>
  )
}
