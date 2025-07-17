'use client'

import {
  LTLocation,
  LTWorker,
  PossibilityData,
  WorkerTimetable,
} from '@/src/utils/types'
import Table from '@/src/components/global/table/Table'
import {useCallback, useMemo} from 'react'
import Cell from './Cell'
import {DateTime, Interval} from 'luxon'
import PossibilityButton from '@/src/components/timetable/PossibilityButton'
import {Header} from '@tanstack/react-table'

interface TimetablePageProps {
  data: WorkerTimetable[]
  dates: [string, string]
  locations: LTLocation[]
}

export default function TimetablePage({
  data,
  dates,
  locations,
}: TimetablePageProps) {
  const update = useCallback((type: 'value' | 'location', value: any) => {
    console.debug(type, value)
  }, [])

  const today = useMemo(() => DateTime.now().setZone('Europe/Moscow'), [])

  const headerClassNameAction = useCallback(
    (header: Header<any, any>) =>
      header.column.columnDef.header ===
      today.toFormat('EEE, dd.MM', {locale: 'ru-RU'})
        ? 'bg-success-600 text-foreground-100'
        : 'bg-default-100',
    [today],
  )

  const daysColumns = useMemo(() => {
    const interval = Interval.fromISO(`${dates[0]}/${dates[1]}`)
    const newDates = [
      ...interval.splitBy({days: 1}).map(d => d.start?.toFormat('yyyy-MM-dd')),
      interval.end?.toFormat('yyyy-MM-dd'),
    ]

    return newDates.map(date => {
      if (!date) return {}
      return {
        header: DateTime.fromISO(date).toFormat('EEE, dd.MM', {
          locale: 'ru-RU',
        }),
        accessorFn: (row: WorkerTimetable) =>
          row.possibility_data?.find(d => d.date === date),
        cell: ({getValue}: {getValue: () => PossibilityData}) => (
          <PossibilityButton data={getValue()} locations={locations} />
        ),
      }
    })
  }, [dates, locations])

  const columns = useMemo(() => {
    return [
      {
        header: 'Сотрудник',
        accessorKey: 'worker',
        meta: {frozen: true, fixedPosition: 0},
        cell: ({getValue}: {getValue: () => LTWorker}) => (
          <Cell data={getValue()} />
        ),
      },
      ...daysColumns,
    ]
  }, [daysColumns])

  return (
    <div>
      <Table
        data={data}
        columns={columns}
        headerClassNameAction={headerClassNameAction}></Table>
    </div>
  )
}
