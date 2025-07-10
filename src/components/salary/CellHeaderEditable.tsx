import {SalaryData} from '@/src/utils/types'
import {
  DatePicker,
  DateValue,
  Divider,
  Input,
  TimeInput,
  Tooltip,
} from '@heroui/react'
import {useCallback, useMemo} from 'react'
import CellChip from '@/src/components/salary/CellChip'
import {DateTime} from 'luxon'
import {Ruble} from 'solar-icon-set'
import LocationIcon from '@/src/components/global/LocationIcon'
import DeleteButton from '@/src/components/salary/DeleteButton'
import {parseDate} from '@internationalized/date'

export default function CellHeaderEditable({
  data,
  handleEdit,
  handleDelete,
}: {
  data: SalaryData
  handleEdit: (data: SalaryData) => void
  handleDelete: any
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

  const salaryDate = useMemo(() => DateTime.fromISO(data.date), [data.date])

  const update = useCallback(
    (
      value:
        | string
        | {
            hour: number
            minute: number
          }
        | DateValue
        | null,
      type:
        | 'delete'
        | 'newDate'
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

      if (type === 'delete') {
        return handleDelete(newData)
      }

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

      if (type === 'newDate') {
        const newValue = value as DateValue | null
        if (!(newValue?.day && newValue?.year && newValue?.month)) {
          return
        }

        const newDate = DateTime.now()
          .setZone('Europe/Moscow')
          .set({day: newValue.day, month: newValue.month, year: newValue.year})

        value = newDate.toFormat('yyyy-MM-dd')
      }

      // @ts-ignore
      newData[type] = value

      handleEdit(newData)
    },
    [data, handleDelete, handleEdit],
  )

  return (
    <>
      <div className={`col-span-2 flex items-center justify-center gap-1`}>
        <Tooltip
          content={
            <p className="w-fit">
              {data.created_by} {date.toFormat('dd.MM yyyy')}
            </p>
          }>
          <div className="flex items-center gap-2">
            <LocationIcon locationName={data.location.name} />
            <p>{data.location.name}</p>
          </div>
        </Tooltip>
      </div>
      <DatePicker
        className="col-span-2"
        onChange={value => update(value, 'newDate')}
        value={parseDate(salaryDate.toFormat('yyyy-MM-dd'))}
      />
      <DeleteButton
        callback={() => update('', 'delete')}
        className="col-span-2 w-full"
      />
      <TimeInput
        aria-label="Начало смены"
        // @ts-ignore
        value={time.start}
        // @ts-ignore
        onChange={value => update(value, 'start_time')}
      />
      <TimeInput
        aria-label="Конец смены"
        // @ts-ignore
        value={time.end}
        // @ts-ignore
        onChange={value => update(value, 'end_time')}
      />
      <Input
        aria-label="Сумма за смену"
        className="text-foreground col-span-2"
        value={data.value.toString()}
        onValueChange={value => update(value, 'value')}
        endContent={<Ruble />}></Input>
      <Divider className="col-span-2 w-full" />
      <p className="col-span-2 text-xs">Переработка</p>
      {/*// @ts-ignore*/}
      <TimeInput
        aria-label="Начало переработки"
        // @ts-ignore
        value={overWorkTime.start}
        // @ts-ignore
        onChange={value => update(value, 'overwork_start')}
      />
      {/*// @ts-ignore*/}
      <TimeInput
        aria-label="Конец переработки"
        // @ts-ignore
        value={overWorkTime.end}
        // @ts-ignore
        onChange={value => update(value, 'overwork_end')}
      />
      <Input
        aria-label="Сумма за переработку"
        className="text-foreground col-span-2 w-fit justify-self-end text-end text-xs"
        value={data.overwork?.toString() || ''}
        onValueChange={value => update(value, 'overwork')}
        endContent={<Ruble />}></Input>
      <CellChip>Бонусы</CellChip>
      <Input
        aria-label="Бонусы"
        className="col-2 w-fit justify-self-end text-end"
        onValueChange={value => update(value, 'bonuses')}
        value={data.bonuses || ''}
      />
      <CellChip>Штрафы</CellChip>
      <Input
        aria-label="Штрафы"
        className="col-2 w-fit justify-self-end text-end"
        onValueChange={value => update(value, 'fines')}
        value={data.fines || ''}
      />
    </>
  )
}
