'use client'

import {LTWorker, TimetableData, WorkerTimetable} from '@/src/utils/types'
import Table from '@/src/components/global/table/Table'
import {useMemo} from 'react'
import Cell from './Cell'
import {DateTime, Interval} from 'luxon'

interface TimetablePageProps {
  data: WorkerTimetable[]
  dates: [string, string]
}

export default function TimetablePage({data, dates}: TimetablePageProps) {
  const daysColumnds = useMemo(() => {
    const interval = Interval.fromISO(`${dates[0]}/${dates[1]}`)
    const newDates = [
      ...interval.splitBy({days: 1}).map(d => d.start?.toFormat('yyyy-MM-dd')),
      interval.end?.toFormat('yyyy-MM-dd'),
    ]

    return newDates.map(date => {
      if (!date) return {}
      return {
        header: DateTime.fromISO(date).toFormat('dd.MM'),
        accessorFn: (row: WorkerTimetable) =>
          row.data?.find(d => d.date === date),
        cell: ({getValue}: {getValue: () => TimetableData}) => (
          <p>{getValue() ? JSON.stringify(getValue()) : ''}</p>
        ),
      }
    })
  }, [dates])

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
      ...daysColumnds,
    ]
  }, [daysColumnds])

  return (
    <div>
      <Table data={data} columns={columns}></Table>
    </div>
  )
}
