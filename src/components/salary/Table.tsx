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
import {Divider, Spinner} from '@heroui/react'
import MonthSelect from '@/src/components/salary/MonthSelect'
import TableRow from './TableRow'
import LocationSelect from '@/src/components/salary/LocationSelect'
import useIsMobile from '@/src/hooks/useIsMobile'
import fetchHandler from '@/src/utils/global/fetchHandler'

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
  dates,
}: {
  data: UserSalary[]
  canViewFull: boolean
  canEdit: boolean
  dates: string[]
}) {
  const socketRef = useRef<Socket | null>(null)
  const {worker} = useAuth()
  const [data, setData] = useState<UserSalary[]>(initialData)
  const [date, setDate] = useState<string>(
    DateTime.fromISO(dates[dates.length - 1]).toFormat('yyyy-MM-dd'),
  )
  const [locationId, setLocationId] = useState<number>(
    data
      .find((d: UserSalary) => d.dates.length)
      ?.dates.find(d => d?.location.id)?.location.id || 2,
  )
  const [loading, setLoading] = useState<boolean>(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const localLocationId = localStorage.getItem('salaryLocationId')
    const localDate = localStorage.getItem('salaryDate')

    if (localLocationId) {
      setLocationId(parseInt(localLocationId))
    }

    if (localDate) {
      setDate(localDate)
    }

    ;(async () => {
      const data = await fetchHandler({
        url: '/api/getSalaryData',
        body: {
          locationId: localLocationId || locationId,
          date: localDate || date,
        },
      })

      if (data) {
        setData(data.data)
      }
    })()
  }, [])

  useEffect(() => {
    const socket = io()

    socketRef.current = socket

    socket.on('salary:update', (data: SalaryData) => {
      if (data.updated_by === worker.id) return

      const date = DateTime.fromISO(data.date)

      setData((prev: UserSalary[]) =>
        prev.map(row => {
          const cell = row[`day${date.toFormat('d')}`] as SalaryData
          const cellDate = DateTime.fromISO(cell.date)

          const isTarget =
            typeof cell === 'object' &&
            cell?.worker_id === data.worker_id &&
            date.toFormat('yyyy-MM-dd') === cellDate.toFormat('yyyy-MM-dd')

          if (!isTarget) return row

          return {
            ...row,
            [`day${date.toFormat('d')}`]: {...data},
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

  const daysInMonth = useMemo(
    () => DateTime.fromFormat(date, 'yyyy-MM-dd').daysInMonth!,
    [date],
  )

  const showUserColumn = data.length > 1

  const daysColumns = useMemo(() => {
    return Array.from({length: daysInMonth}, (_, i) => {
      const day = i + 1
      const newDate = DateTime.fromFormat(date, 'yyyy-MM-dd').set({day})
      const dateValue = newDate.toFormat('EEE, dd.MM', {locale: 'ru-RU'})

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
  }, [canEdit, canViewFull, date, daysInMonth, handleEdit])

  const columns = useMemo(() => {
    const baseColumns = []

    if (showUserColumn) {
      baseColumns.push({
        header: 'Сотрудник',
        accessorKey: 'user',
        cell: ({getValue}: {getValue: () => SalaryUser}) => (
          <WorkerCell data={getValue()} />
        ),
        meta: {frozen: true, fixedPosition: 0},
      })
    }

    return [...baseColumns, ...daysColumns]
  }, [showUserColumn, daysColumns])

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

  const onMonthUpdate = useCallback(
    async (date: string) => {
      setLoading(true)
      setDate(date)
      localStorage.setItem('salaryDate', date)

      const data = await fetchHandler({
        url: '/api/getSalaryData',
        body: {locationId, date},
      })

      if (data) {
        setData(data.data)
      }

      setLoading(false)
    },
    [locationId],
  )

  const onLocationUpdate = useCallback(
    async (locationId: number) => {
      setLoading(true)
      setLocationId(locationId)
      localStorage.setItem('salaryLocationId', `${locationId}`)

      const data = await fetchHandler({
        url: '/api/getSalaryData',
        body: {locationId, date},
      })

      if (data) {
        setData(data.data)
      }

      setLoading(false)
    },
    [date],
  )

  return (
    <div className="h-full w-full px-2">
      <div
        className={`sticky left-0 mb-4 flex ${isMobile ? 'w-[100dvw]' : 'w-fit'} flex-wrap items-center gap-2 p-4 text-xl font-bold`}>
        <p>
          {capitalize(DateTime.now().toFormat('LLLL yyyy', {locale: 'ru-RU'}))}
        </p>
        <MonthSelect dates={dates} date={date} callback={onMonthUpdate} />
        {canViewFull && (
          <LocationSelect callback={onLocationUpdate} locationId={locationId} />
        )}
        {loading && (
          <>
            <Spinner /> Загрузка
          </>
        )}
      </div>
      <div className={`bg-content1 rounded-large relative w-full pt-4`}>
        <table className="h-auto w-full max-w-full">
          <thead
            className="[&>tr]:first:shadow-small sticky z-1000"
            style={{
              top: `${document.querySelector('header')?.offsetHeight}px`,
            }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="rounded-2xl">
                {headerGroup.headers.map((header, index) => (
                  <Fragment key={header.id}>
                    <th
                      key={header.id}
                      className={`bg-default-100 test-start h-[2rem] w-[5rem] min-w-[5rem] px-2 py-3 align-middle text-xs font-medium tracking-wider first:rounded-s-lg last:rounded-e-lg ${header.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100' : ''}`}
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
                  </Fragment>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="after:block">
            <tr className="h-4"></tr>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                row={row}
                rowIndex={rowIndex}
                getFixedColumnLeftPosition={getFixedColumnLeftPosition}
                canEdit={canEdit}
                dataLength={data.length}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
