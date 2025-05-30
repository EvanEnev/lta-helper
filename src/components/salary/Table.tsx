'use client'

import {SalaryData, SalaryUser, UserSalary} from '@/src/utils/types'
import {flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import Cell from './Cell'
import {RowData} from '@tanstack/react-table'
import WorkerCell from '@/src/components/salary/WorkerCell'
import {io} from 'socket.io-client'
import {Socket} from 'socket.io-client'
import {DateTime} from 'luxon'
import {Button, Checkbox, DateRangePicker} from '@heroui/react'
import {useAuth} from '@/src/components/global/providers/authProvider'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    frozen?: boolean
    fixedPosition?: number
  }
}

export default function Table({
  data: initialData,
  canEdit,
}: {
  data: UserSalary[]
  canEdit: boolean
}) {
  const socketRef = useRef<Socket | null>(null)
  const {worker} = useAuth()
  const [dateRange, setDateRange] = useState(null)
  const [bonuses, setBonuses] = useState<boolean>(false)

  const [data, setData] = useState<UserSalary[]>(initialData)

  useEffect(() => {
    const socket = io()

    socketRef.current = socket

    socket.on('salary:update', (data: SalaryData) => {
      if (data.updated_by === worker.id) return

      const date = DateTime.fromISO(data.date)

      setData((prev: UserSalary[]) =>
        prev.map(row => {
          const cell = row[`day${date.toFormat('dd')}`] as SalaryData

          const cellDate = DateTime.fromISO(cell.date)

          const isTarget =
            typeof cell === 'object' &&
            cell?.worker_id === data.worker_id &&
            date.equals(cellDate)

          if (!isTarget) return row

          return {
            ...row,
            [`day${date.toFormat('dd')}`]: {...data},
          }
        }),
      )
    })

    return () => {
      socket.off('salary:update')
      socket.disconnect()
    }
  }, [worker.id])

  const handleEdit = useCallback(
    (data: SalaryData) => {
      socketRef.current?.emit('update:user_salary', {
        ...data,
        updated_by: worker.id,
      })
    },
    [worker],
  )

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)

  const columns = useMemo(() => {
    const baseColumns = [
      {
        header: 'Позывной',
        accessorKey: 'user',
        cell: ({getValue}: {getValue: () => SalaryUser}) => (
          <WorkerCell data={getValue()} />
        ),
        meta: {frozen: true, fixedPosition: 0},
      },
      // {header: 'Информация', accessorKey: 'info', cell: () => <InfoCell />, meta: {frozen: true, fixedPosition: 1}}
    ]

    const daysColumns = Array.from({length: daysInMonth}, (_, i) => {
      const day = i + 1
      const date = DateTime.now().set({day})
      const dateValue = date.toFormat('dd.MM')

      return {
        header: dateValue,
        accessorKey: `day${day}`,
        cell: ({getValue}: {getValue: () => SalaryData | undefined}) => (
          <Cell data={getValue()} canEdit={canEdit} handleEdit={handleEdit} />
        ),
      }
    })

    return [...baseColumns, ...daysColumns]
  }, [canEdit, daysInMonth, handleEdit])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const getFixedColumnLeftPosition = (fixedIndex: number = 0) => {
    let leftOffset = 0
    const columns = table.getAllColumns()
    for (let i = 0; i < fixedIndex; i++) {
      leftOffset += columns[i].getSize()
    }

    return leftOffset
  }

  const handleDownload = async () => {
    console.log(dateRange)
    if (!dateRange) {
      return
    }

    const startDate = DateTime.now().set({
      // @ts-ignore
      year: dateRange.start.year,
      // @ts-ignore
      month: dateRange.start.month,
      // @ts-ignore
      day: dateRange.start.day,
    })

    const endDate = DateTime.now().set({
      // @ts-ignore
      year: dateRange.end.year,
      // @ts-ignore
      month: dateRange.end.month,
      // @ts-ignore
      day: dateRange.end.day,
    })

    const res = await fetch('/api/excel', {
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate.toISO(),
        end_date: endDate.toISO(),
        bonuses,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      alert('Ошибка при создании Excel')
      return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Ведомость ${startDate.toFormat('dd.MM.yyyy')}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="relative overflow-auto">
      {canEdit && (
        <div className="flex flex-col gap-2">
          <DateRangePicker
            className="max-w-fit"
            onChange={val =>
              // @ts-ignore
              setDateRange(val)
            }
          />
          <Checkbox checked={bonuses} onValueChange={setBonuses}>
            Бонусы
          </Checkbox>
          <Button className="max-w-fit" onPress={handleDownload}>
            Выгрузить ведомость
          </Button>
        </div>
      )}
      <div className="mb-4 text-xl font-bold">
        {new Date(currentYear, currentMonth).toLocaleDateString('ru-RU', {
          month: 'long',
          year: 'numeric',
        })}
      </div>
      <table className="relative min-w-full divide-x-4 divide-y divide-gray-200">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  className={`sticky top-0 w-[5rem] min-w-[5rem] px-2 py-3 text-center text-xs font-medium tracking-wider uppercase sm:w-[10rem] sm:min-w-[10rem] ${index === 1 ? 'rounded-tr-2xl' : ''} ${index > 0 && index !== 1 ? 'border-t border-l border-gray-50' : ''} ${header.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}
                  style={{
                    width: header.getSize(),
                    minWidth: header.getSize(),
                    ...(header.column.columnDef.meta?.frozen && {
                      left: getFixedColumnLeftPosition(
                        header.column.columnDef.meta?.fixedPosition,
                      ),
                    }),
                  }}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="h-[10rem]">
              {row.getVisibleCells().map((cell, index) => (
                <td
                  key={cell.id}
                  className={`w-[5rem] min-w-[5rem] p-2 text-center text-sm sm:w-[10rem] sm:min-w-[10rem] ${index === 1 ? 'rounded-br-2xl' : ''} ${index > 1 ? 'border-b-1' : ''} ${index > 0 ? 'border-l border-gray-50' : ''} ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}
                  style={{
                    ...(cell.column.columnDef.meta?.frozen && {
                      left: getFixedColumnLeftPosition(
                        cell.column.columnDef.meta?.fixedPosition,
                      ),
                    }),
                  }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
