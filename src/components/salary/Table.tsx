import {SalaryData, SalaryUser, UserSalary} from '@/src/utils/types'
import {flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
  Fragment,
} from 'react'
import Cell from './Cell'
import {RowData} from '@tanstack/react-table'
import WorkerCell from '@/src/components/salary/WorkerCell'
import {io} from 'socket.io-client'
import {Socket} from 'socket.io-client'
import {DateTime} from 'luxon'
import {useAuth} from '@/src/components/global/providers/authProvider'
import capitalize from '@/lib/functions/capitalize'
import {Divider} from '@heroui/react'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    frozen?: boolean
    fixedPosition?: number
  }
}

export default memo(function Table({
  data: initialData,
  canViewFull,
  canEdit,
}: {
  data: UserSalary[]
  canViewFull: boolean
  canEdit: boolean
}) {
  const socketRef = useRef<Socket | null>(null)
  const {worker} = useAuth()
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
    const baseColumns = []

    if (data.length > 1) {
      baseColumns.push({
        header: 'Сотрудник',
        accessorKey: 'user',
        cell: ({getValue}: {getValue: () => SalaryUser}) => (
          <WorkerCell data={getValue()} />
        ),
        meta: {frozen: true, fixedPosition: 0},
      })
    }

    const daysColumns = Array.from({length: daysInMonth}, (_, i) => {
      const day = i + 1
      const date = DateTime.now().set({day})
      const dateValue = date.toFormat('dd.MM')

      return {
        header: dateValue,
        accessorKey: `day${day}`,
        cell: ({getValue}: {getValue: () => SalaryData | undefined}) => (
          <Cell
            data={getValue()}
            canEdit={canEdit}
            handleEdit={handleEdit}
            canViewFull={canViewFull}
          />
        ),
      }
    })

    return [...baseColumns, ...daysColumns]
  }, [canEdit, canViewFull, data.length, daysInMonth, handleEdit])

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

  return (
    <div className="w-full px-2">
      <div className="sticky left-0 mb-4 w-fit pl-4 text-xl font-bold">
        {capitalize(DateTime.now().toFormat('LLLL yyyy', {locale: 'ru-RU'}))}
      </div>
      <div className="bg-content1 rounded-large relative pt-4">
        <table className="h-auto min-w-full table-fixed">
          <thead
            className="[&>tr]:first:shadow-small sticky z-1000"
            style={{
              top: `${document.querySelector('header')?.offsetHeight}px`,
            }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="rounded-2xl">
                {headerGroup.headers.map((header, index) => (
                  <>
                    <th
                      key={header.id}
                      className={`bg-default-100 test-start h-[2rem] w-[5rem] min-w-[5rem] px-2 py-3 align-middle text-xs font-medium tracking-wider uppercase first:rounded-s-lg last:rounded-e-lg ${header.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100' : ''}`}
                      style={{
                        width: `${header.getSize()}px`,
                        minWidth: `${header.getSize()}px`,
                        ...(header.column.columnDef.meta?.frozen && {
                          left: `${getFixedColumnLeftPosition(
                            header.column.columnDef.meta?.fixedPosition,
                          )}px`,
                        }),
                      }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                    <th className="bg-default-100 w-px py-2">
                      <Divider
                        className="mx-auto h-[2rem]"
                        orientation="vertical"
                        hidden={index === headerGroup.headers.length - 1}
                      />
                    </th>
                  </>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="after:block">
            <tr className="h-4"></tr>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <Fragment key={row.id}>
                <tr className={`${canEdit ? 'h-[5rem]' : 'h-[10rem]'}`}>
                  {row.getVisibleCells().map((cell, index) => (
                    <Fragment key={cell.id}>
                      <td
                        id={cell.id}
                        className={`mx-auto ${index === 0 && rowIndex === 0 && 'rounded-t-2xl'} w-[5rem] min-w-[5rem] p-2 text-center text-sm sm:w-[10rem] sm:min-w-[10rem] ${index === 1 ? 'rounded-br-2xl' : ''} ${!cell.column.columnDef.meta?.frozen ? '' : ''} ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}
                        style={{
                          ...(cell.column.columnDef.meta?.frozen && {
                            left: `${getFixedColumnLeftPosition(
                              cell.column.columnDef.meta?.fixedPosition,
                            )}px`,
                          }),
                        }}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                      <td className="h-full py-2">
                        <Divider
                          className="mx-auto min-h-[5rem]"
                          orientation="vertical"
                          hidden={
                            (data.length > 1 && index === 0) ||
                            index === row.getVisibleCells().length - 1
                          }
                          style={{
                            height: `${document.getElementById(cell.id)?.offsetHeight}px`,
                          }}
                        />
                      </td>
                    </Fragment>
                  ))}
                </tr>
                <tr>
                  {[
                    ...row.getVisibleCells(),
                    ...new Array(row.getVisibleCells().length).fill(
                      row.getVisibleCells()[row.getVisibleCells().length - 1],
                    ),
                  ].map((cell, index) => (
                    <td
                      key={index}
                      className={`min-w-px px-1 ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}
                      style={{
                        ...(cell.column.columnDef.meta?.frozen && {
                          left: `${getFixedColumnLeftPosition(
                            cell.column.columnDef.meta?.fixedPosition,
                          )}px`,
                        }),
                      }}>
                      <Divider
                        className="mx-auto"
                        hidden={
                          rowIndex === table.getRowModel().rows.length - 1
                        }
                      />
                    </td>
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
