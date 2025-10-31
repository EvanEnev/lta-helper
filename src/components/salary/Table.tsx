'use client'

import {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  SalaryData,
  SalaryUser,
  UserSalary,
} from '@/src/utils/types'
import {Header, Row, RowData} from '@tanstack/react-table'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import Cell from './Cell'
import WorkerCell from '@/src/components/salary/WorkerCell'
import {io, Socket} from 'socket.io-client'
import {DateTime, Interval} from 'luxon'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Spinner,
} from '@heroui/react'
import MonthSelect from '@/src/components/salary/MonthSelect'
import LocationSelect from '@/src/components/global/LocationSelect'
import fetchHandler from '@/src/utils/global/fetchHandler'
import CTable from '@/src/components/global/table/Table'
import useIsMobile from '@/src/hooks/useIsMobile'
import checkPermissions from '@/lib/functions/checkPermissions'
import {Filter} from 'solar-icon-set'

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
  gamesPayments,
  faceIdData,
  locations,
}: {
  data: UserSalary[]
  canViewFull: boolean
  canEdit: boolean
  dates: string[]
  gamesPayments: LTGamePayment[]
  faceIdData: LTFaceIdData[]
  locations: LTLocation[]
}) {
  const [columnFilters, setColumnFiltersAction] = useState([])
  const [isReviewMode, setReviewMode] = useState<boolean>(false)
  const socketRef = useRef<Socket | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const {worker, headerRef, pageSettings} = useAuth()
  const [data, setData] = useState<UserSalary[]>(initialData)
  const [date, setDate] = useState<string>(
    DateTime.fromISO(dates[dates.length - 1]).toFormat('yyyy-MM-dd'),
  )
  const [nameFilter, setNameFilter] = useState<string>('')
  const [locationId, setLocationId] = useState<number>(
    data
      .find((d: UserSalary) => d.dates.length)
      ?.dates.find(d => d?.location.id)?.location.id ||
      worker.locationId ||
      2,
  )
  const [loading, setLoading] = useState<boolean>(false)
  const isMobile = useIsMobile()

  const today = useMemo(() => DateTime.now().setZone('Europe/Moscow'), [])

  const updateData = useCallback(
    async (
      key: 'date' | 'location' | null,
      value: string | LTLocation | null,
    ) => {
      setLoading(true)

      let newLocationId = locationId
      let newDate = date

      if (key === 'date') {
        newDate = value as string
        localStorage.setItem('salaryDate', newDate)
        setDate(newDate)
      } else if (key === 'location') {
        newLocationId = (value as LTLocation).id
        setLocationId(newLocationId)
        if (newLocationId !== 0) {
          localStorage.setItem('salaryLocationId', newLocationId.toString())
        }
      }

      const data = await fetchHandler({
        url: '/api/salary/getData',
        body: {
          locationId: newLocationId || 1,
          date: newDate,
          allLocations: newLocationId === 0,
        },
      })

      if (data.data) {
        setData(data.data)
      }

      setLoading(false)
    },
    [date, locationId],
  )

  useEffect(() => {
    const localLocationId = localStorage.getItem('salaryLocationId')
    const localDate = localStorage.getItem('salaryDate')
    const reviewMode = localStorage.getItem('salaryReview')

    if (localLocationId) {
      setLocationId(parseInt(localLocationId))
    }

    if (localDate) {
      setDate(localDate)
    }

    if (reviewMode) {
      setReviewMode(JSON.parse(reviewMode))
    }

    ;(async () => {
      const data = await fetchHandler({
        url: '/api/salary/getData',
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

  const checkTarget = useCallback(
    (row: UserSalary, date: DateTime, data: any) => {
      return row?.user.id === data.worker_id
    },
    [],
  )

  useEffect(() => {
    const socket = io()

    socketRef.current = socket

    socket.on('salary:update', (data: SalaryData) => {
      if (data.updated_by === worker.id) return

      const date = DateTime.fromISO(data.date)

      if (locationId && data.location.id !== locationId) return

      setData((prev: UserSalary[]) =>
        prev.map(row => {
          if (!checkTarget(row, date, data)) return row

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
  }, [checkTarget, locationId, worker.id])

  const handleEdit = useCallback(
    (data: SalaryData) => {
      const date = DateTime.fromISO(data.date)

      // @ts-ignore
      if (data.newDate) {
        // @ts-ignore
        const newDate = DateTime.fromFormat(data.newDate, 'yyyy-MM-dd')

        setData((prev: UserSalary[]) =>
          prev.map(row => {
            if (!checkTarget(row, date, data)) return row

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
            if (!checkTarget(row, date, data)) return row

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
    [checkTarget, worker.id],
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

  const canViewLocation = useMemo(
    () =>
      checkPermissions(['view_location_salary', 'view_full_salary'], worker),
    [worker],
  )

  const daysInMonth = useMemo(
    () => DateTime.fromFormat(date, 'yyyy-MM-dd').daysInMonth!,
    [date],
  )

  const showUserColumn = data.length > 1 || columnFilters.length

  const daysColumns = useMemo(() => {
    return Array.from({length: daysInMonth}, (_, i) => {
      const day = i + 1
      const newDate = DateTime.fromFormat(date, 'yyyy-MM-dd').set({
        day,
        hour: 0,
        minute: 0,
        second: 0,
      })
      const dateValue = newDate.toFormat('EEE, dd.MM', {locale: 'ru-RU'})

      return {
        header: dateValue,
        accessorKey: `day${day}`,
        cell: ({getValue}: {getValue: () => SalaryData | undefined}) => {
          const faceId = faceIdData.find(
            d => d.workerId === getValue()?.worker_id,
          )
          const faceIdLocation = faceId?.data.filter(d =>
            // d.location.id === getValue()?.location?.id &&
            Interval.fromDateTimes(
              newDate.plus({hour: 5}),
              newDate.endOf('day').plus({hour: 5}),
            ).contains(DateTime.fromFormat(d.date, 'yyyy-MM-dd HH:mm:ss')),
          )

          return (
            <Cell
              isReviewMode={isReviewMode}
              locations={locations}
              faceIdData={faceIdLocation}
              gamesPayments={gamesPayments}
              data={getValue()}
              canEdit={canEdit}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              canViewFull={canViewFull}
            />
          )
        },
      }
    })
  }, [
    daysInMonth,
    date,
    faceIdData,
    isReviewMode,
    locations,
    gamesPayments,
    canEdit,
    handleEdit,
    handleDelete,
    canViewFull,
  ])

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
        filterFn: (row: Row<any>, columnId: string, filterValue: string) => {
          if (!filterValue) return true

          return (row.getValue(columnId) as SalaryUser).name
            .toLowerCase()
            .startsWith(filterValue?.toLowerCase())
        },
      })
    }

    return [...baseColumns, ...daysColumns]
  }, [showUserColumn, daysColumns])

  const headerClassNameAction = useCallback(
    (header: Header<any, any>) =>
      header.column.columnDef.header ===
      today.toFormat('EEE, dd.MM', {locale: 'ru-RU'})
        ? 'bg-success-600 text-foreground-100'
        : 'bg-default-100',
    [today],
  )

  useEffect(() => {
    // @ts-ignore
    setColumnFiltersAction(prev => {
      // @ts-ignore
      const other = prev.filter(f => f.id !== 'user')
      return nameFilter ? [...other, {id: 'user', value: nameFilter}] : other
    })
  }, [nameFilter])

  return (
    <div className="h-full w-full px-2">
      <div
        ref={wrapperRef}
        style={{
          left: `${isMobile ? 0 : headerRef.current?.offsetWidth || 0}px`,
          top: `${isMobile ? `${headerRef.current?.offsetHeight || 0}px` : 0}`,
        }}
        className={`scrolled sticky top-2 left-0 z-1000 mb-4 flex w-[100dvw] flex-wrap items-center gap-2 p-4 text-xl font-bold`}>
        <MonthSelect
          type="select"
          labelPlacement="inside"
          className="w-fit min-w-[10rem]"
          dates={dates}
          date={date}
          callback={(date: string) => updateData('date', date)}
        />
        {canViewLocation &&
          (isMobile ? (
            <Dropdown closeOnSelect={false}>
              <DropdownTrigger>
                <Button variant="flat" isIconOnly>
                  <Filter />
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="min-w-[10rem]">
                <DropdownItem key="location">
                  <LocationSelect
                    labelPlacement="inside"
                    includeAll={true}
                    className="w-fit"
                    callback={(location: LTLocation | null) =>
                      updateData('location', location)
                    }
                    locationId={locationId}
                  />
                </DropdownItem>
                <DropdownItem key="name">
                  <Input
                    className="w-fit"
                    label="Позывной"
                    value={nameFilter}
                    onValueChange={value => setNameFilter(value)}
                  />
                </DropdownItem>
                {canViewFull ? (
                  <DropdownItem key="review">
                    <Checkbox
                      isSelected={isReviewMode}
                      onValueChange={value => {
                        setReviewMode(value)
                        localStorage.setItem('salaryReview', `${value}`)
                      }}>
                      Проверка
                    </Checkbox>
                  </DropdownItem>
                ) : null}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <>
              <LocationSelect
                labelPlacement="inside"
                includeAll={true}
                className="w-fit"
                callback={(location: LTLocation | null) =>
                  updateData('location', location)
                }
                locationId={locationId}
              />
              <Input
                className="w-fit"
                label="Позывной"
                value={nameFilter}
                onValueChange={value => setNameFilter(value)}
              />
              {canViewFull && (
                <Checkbox
                  isSelected={isReviewMode}
                  onValueChange={value => {
                    setReviewMode(value)
                    localStorage.setItem('salaryReview', `${value}`)
                  }}>
                  Проверка
                </Checkbox>
              )}
            </>
          ))}
        {loading && (
          <>
            <Spinner color="default" /> Загрузка
          </>
        )}
        {pageSettings.map(component => component.components.map(c => c))}
      </div>
      <CTable
        columnFilters={columnFilters}
        setColumnFiltersAction={setColumnFiltersAction}
        headerOffset={
          (wrapperRef.current?.offsetHeight || 0) +
          (isMobile ? headerRef.current?.offsetHeight || 0 : 0)
        }
        data={data}
        columns={columns}
        headerClassNameAction={headerClassNameAction}
      />
    </div>
  )
})
