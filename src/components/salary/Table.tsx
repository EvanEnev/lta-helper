import {LTLocation, SalaryData, SalaryUser, UserSalary} from '@/src/utils/types'
import {Header} from '@tanstack/react-table'
import {useCallback, useEffect, useMemo, useRef, useState, memo} from 'react'
import Cell from './Cell'
import {RowData} from '@tanstack/react-table'
import WorkerCell from '@/src/components/salary/WorkerCell'
import {io} from 'socket.io-client'
import {Socket} from 'socket.io-client'
import {DateTime} from 'luxon'
import {useAuth} from '@/src/components/global/providers/authProvider'
import capitalize from '@/lib/functions/capitalize'
import {Checkbox, Input, Spinner} from '@heroui/react'
import MonthSelect from '@/src/components/salary/MonthSelect'
import LocationSelect from '@/src/components/salary/LocationSelect'
import useIsMobile from '@/src/hooks/useIsMobile'
import fetchHandler from '@/src/utils/global/fetchHandler'
import CTable from '@/src/components/global/table/Table'

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
  const [filter, setFilter] = useState<string>('')
  const [allLocations, setAllLocations] = useState<boolean>(false)
  const [locationId, setLocationId] = useState<number>(
    data
      .find((d: UserSalary) => d.dates.length)
      ?.dates.find(d => d?.location.id)?.location.id || 2,
  )
  const [loading, setLoading] = useState<boolean>(false)
  const isMobile = useIsMobile()

  const today = useMemo(() => DateTime.now().setZone('Europe/Moscow'), [])

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
      const date = DateTime.fromISO(data.date)

      // @ts-ignore
      if (data.newDate) {
        // @ts-ignore
        const newDate = DateTime.fromFormat(data.newDate, 'yyyy-MM-dd')

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
              // @ts-ignore
              [`day${newDate.toFormat('d')}`]: {
                ...data,
                // @ts-ignore
                date: data.newDate,
              },
              [`day${date.toFormat('d')}`]: '',
            }
          }),
        )
      }

      // @ts-ignore
      if (data.newLocation) {
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
              // @ts-ignore
              [`day${date.toFormat('d')}`]: {
                ...data,
                // @ts-ignore
                location: data.newLocation,
              },
            }
          }),
        )
      }

      socketRef.current?.emit('update:user_salary', {
        ...data,
        updated_by: worker.id,
      })
    },
    [worker],
  )

  const handleDelete = useCallback(
    (data: SalaryData) => {
      socketRef.current?.emit('update:user_salary', {
        ...data,
        delete: true,
        updated_by: worker.id,
      })
    },
    [worker],
  )

  const daysInMonth = useMemo(
    () => DateTime.fromFormat(date, 'yyyy-MM-dd').daysInMonth!,
    [date],
  )

  const showUserColumn = data.length > 1 || filter

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
            handleDelete={handleDelete}
            canViewFull={canViewFull}
          />
        ),
      }
    })
  }, [canEdit, canViewFull, date, daysInMonth, handleDelete, handleEdit])

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
    async (location: LTLocation) => {
      setLoading(true)
      setLocationId(locationId)
      localStorage.setItem('salaryLocationId', `${location.id}`)

      const data = await fetchHandler({
        url: '/api/getSalaryData',
        body: {locationId: location.id, date},
      })

      if (data) {
        setData(data.data)
      }

      setLoading(false)
    },
    [date],
  )

  useEffect(() => {
    const name = filter.toLowerCase().trim()
    if (!name) return setData(initialData)

    console.debug(name, data[0]?.user)
    const filtered = initialData.filter(d =>
      d.user.name.trim().toLowerCase().startsWith(name),
    )

    setData(filtered)
  }, [filter])

  useEffect(() => {
    ;(async () => {
      setLoading(true)

      console.debug(allLocations)
      const data = await fetchHandler({
        url: '/api/getSalaryData',
        body: {locationId: locationId, date, allLocations},
      })

      console.debug(data.data)
      if (data && filter) {
        const name = filter.toLowerCase().trim()

        const filtered = data.data.filter((d: any) =>
          d.user.name.trim().toLowerCase().startsWith(name),
        )
        setData(filtered)
      } else if (data) {
        setData(data.data)
      }

      setLoading(false)
    })()
  }, [allLocations])

  const headerClassNameAction = useCallback(
    (header: Header<any, any>) =>
      header.column.columnDef.header ===
      today.toFormat('EEE, dd.MM', {locale: 'ru-RU'})
        ? 'bg-success-600 text-foreground-100'
        : 'bg-default-100',
    [today],
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
        <Checkbox onValueChange={value => setAllLocations(value)}>
          Все площадки
        </Checkbox>
        {canViewFull && (
          <Input
            label="Позывной"
            onValueChange={value => setFilter(value)}></Input>
        )}
        {loading && (
          <>
            <Spinner /> Загрузка
          </>
        )}
      </div>
      <CTable
        data={data}
        columns={columns}
        headerClassNameAction={headerClassNameAction}
      />
    </div>
  )
})
