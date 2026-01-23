'use client'

import {
  LTGamePayment,
  LTLocation,
  LTWorker,
  LTWorkType,
  SalaryData,
  UserSalary,
} from '@/src/utils/types'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {io, Socket} from 'socket.io-client'
import {DateTime} from 'luxon'
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
import useIsMobile from '@/src/hooks/useIsMobile'
import checkPermissions from '@/lib/functions/checkPermissions'
import {Filter} from 'solar-icon-set'
import {useAtomValue} from 'jotai'
import {headerSizesAtom} from '@/src/utils/global/atoms'
import {useTheme} from 'next-themes'
import SalaryRow from '@/src/components/salary/SalaryRow'
import SalaryDaysRow from '@/src/components/salary/SalaryDaysRow'
import unaccent from '@/lib/functions/unaccent'

export default function SalaryPage({
  worker,
  canViewFull,
  canEdit,
  dates: defaultDates,
  gamesPayments,
  locations,
  workTypes,
}: {
  worker: LTWorker
  canViewFull: boolean
  canEdit: boolean
  dates: string[]
  gamesPayments: LTGamePayment[]
  locations: LTLocation[]
  workTypes: LTWorkType[]
}) {
  const {theme} = useTheme()
  const [lastUpdatedId, setLastUpdatedId] = useState<number | null>(null)
  const [isReviewMode, setReviewMode] = useState<boolean>(
    localStorage.getItem('salaryReview')
      ? JSON.parse(localStorage.getItem('salaryReview')!)
      : false,
  )

  const socketRef = useRef<Socket | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [initialData, setInitialData] = useState<UserSalary[]>([])
  const [data, setData] = useState<UserSalary[]>([])
  const [date, setDate] = useState<string>(
    localStorage.getItem('salaryDate')
      ? localStorage.getItem('salaryDate')!
      : DateTime.fromISO(defaultDates[defaultDates.length - 1]).toFormat(
          'yyyy-MM-dd',
        ),
  )
  const headerSizes = useAtomValue(headerSizesAtom)
  const [nameFilter, setNameFilter] = useState<string>('')
  const [hideEmptyFilter, setHideEmptyFilter] = useState<boolean>(false)
  const [locationId, setLocationId] = useState<number>(
    localStorage.getItem('salaryLocationId')
      ? parseInt(localStorage.getItem('salaryLocationId')!)
      : data
          ?.find((d: UserSalary) => d.dates.length)
          ?.dates.find(d => d?.location?.id)?.location.id ||
          worker.locationId ||
          2,
  )
  const [loading, setLoading] = useState<boolean>(false)
  const isMobile = useIsMobile()

  const today = useMemo(() => DateTime.now().setZone('Europe/Moscow'), [])

  const dates: string[] = useMemo(() => {
    console.debug(date)
    const datetime = DateTime.fromFormat(date, 'yyyy-MM-dd')
    const month = datetime.toFormat('MM')

    console.debug(datetime, month)
    const dates = []
    for (let i = 0; i < datetime.daysInMonth!; i++) {
      dates.push(`${i + 1 < 10 ? `0${i + 1}` : `${i + 1}`}.${month}`)
    }

    return dates
  }, [date])

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
        let filtered = data.data
        if (nameFilter) {
          filtered = data.data.filter((row: UserSalary) =>
            unaccent(row.worker.name)
              .toLowerCase()
              .trim()
              .startsWith(unaccent(nameFilter).toLowerCase().trim()),
          )
        }

        if (hideEmptyFilter) {
          filtered = filtered.filter((row: UserSalary) => row.dates.length)
        }

        setData(filtered)

        setInitialData(data.data)
      }

      setLoading(false)
    },
    [date, hideEmptyFilter, locationId, nameFilter],
  )

  useEffect(() => {
    ;(async () => {
      const data = await fetchHandler({
        url: '/api/salary/getData',
        body: {
          locationId: locationId,
          date: date,
        },
      })

      if (data) {
        setData(data.data)
        setInitialData(data.data)
      }
    })()
  }, [])

  const checkTarget = useCallback(
    (row: UserSalary, date: DateTime, data: any) => {
      return row?.worker.id === data.worker_id
    },
    [],
  )

  // TODO: Переделать сокеты
  useEffect(() => {
    const socket = io()

    socketRef.current = socket

    socket.on('salary:update', (newData: SalaryData) => {
      if (lastUpdatedId === newData.id) return

      const date = DateTime.fromISO(newData.date)

      if (locationId && newData.location.id !== locationId) return

      const workerId =
        data.find(row => row.dates.findIndex(d => d.id === newData.id) !== -1)
          ?.worker.id || null

      setData((prev: UserSalary[]) =>
        prev.map(row => {
          if (row.worker.id !== workerId) return row

          let newRow = {...row}

          const index = newRow.dates.findIndex(d => d.date === newData.date)

          newRow.dates[index] = {...newData}

          return newRow
        }),
      )
    })

    return () => {
      socket.off('salary:update')
      socket.disconnect()
    }
  }, [checkTarget, locationId, worker.id])

  const handleEdit = useCallback(
    (data: SalaryData, workerId: number) => {
      setData((prev: UserSalary[]) =>
        prev.map(row => {
          if (row.worker.id !== workerId) return row

          let newRow = {...row}

          const index = newRow.dates.findIndex(d => d.date === data.date)

          newRow.dates[index] = {...data}

          return newRow
        }),
      )

      setLastUpdatedId(data.id)

      socketRef.current?.emit('update:user_salary', {
        ...data,
        updated_by: worker.id,
      })
    },
    [worker.id],
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

  const handleNameFilter = useCallback(
    (value: string) => {
      setNameFilter(value)
      if (!value) return setData(initialData)

      setData(
        initialData.filter(row =>
          unaccent(row.worker.name)
            .toLowerCase()
            .trim()
            .startsWith(unaccent(value).toLowerCase().trim()),
        ),
      )
    },
    [initialData],
  )

  const handleHideFilter = useCallback(
    (value: boolean) => {
      setHideEmptyFilter(value)
      if (!value) return setData(initialData)
      setData(initialData.filter(row => row.dates.length))
    },
    [initialData],
  )

  return (
    <main className="h-fit">
      <div className="relative h-full w-full">
        <div
          ref={wrapperRef}
          style={{
            left: `${headerSizes.width}px`,
          }}
          className={`bg-content1 sticky top-2 z-1000 mb-4 flex h-22 w-dvw flex-wrap items-center gap-2 rounded-2xl p-4 text-xl font-bold`}>
          <MonthSelect
            type="select"
            labelPlacement="inside"
            className="w-fit min-w-40"
            dates={defaultDates}
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
                <DropdownMenu className="min-w-40">
                  <DropdownItem key="location">
                    <LocationSelect
                      labelPlacement="inside"
                      includeAll={true}
                      className="w-fit"
                      callback={(location: LTLocation | null) =>
                        updateData('location', location)
                      }
                      dynamicLocationId
                      locationId={locationId}
                    />
                  </DropdownItem>
                  <DropdownItem key="name">
                    <Input
                      className="w-fit"
                      label="Позывной"
                      onValueChange={value => handleNameFilter(value)}
                    />
                  </DropdownItem>
                  <DropdownItem key="hide">
                    <Checkbox
                      className="border-content1-foreground/20 ml-1 h-full rounded-2xl border-2"
                      onValueChange={value => {
                        handleHideFilter(value)
                      }}>
                      Скрыть пустые
                    </Checkbox>
                  </DropdownItem>
                  {canViewFull ? (
                    <DropdownItem key="review">
                      <Checkbox
                        className="border-content1-foreground/20 ml-1 h-full rounded-2xl border-2"
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
                  dynamicLocationId
                  locationId={locationId}
                />
                <Input
                  className="w-fit"
                  label="Позывной"
                  onValueChange={value => handleNameFilter(value)}
                />
                <Checkbox
                  className="border-content1-foreground/20 ml-1 h-full rounded-2xl border-2"
                  onValueChange={value => {
                    handleHideFilter(value)
                  }}>
                  Скрыть пустые
                </Checkbox>
                {canViewFull && (
                  <Checkbox
                    className="border-content1-foreground/20 ml-1 h-full rounded-2xl border-2"
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
        </div>
        <div
          className="grid w-full auto-rows-auto gap-2"
          style={{
            gridTemplateColumns: `160px repeat(${dates.length}, minmax(320px, 1fr))`,
          }}>
          <SalaryDaysRow
            today={
              today.month === Number(date.slice(5, -3))
                ? today.toFormat('dd.MM')
                : null
            }
            dates={dates}
            workTypes={workTypes}
          />
          {data.map(salary => (
            <SalaryRow
              days={dates}
              key={salary.worker.id}
              canEdit={canEdit}
              canViewFull={canViewFull}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              gamesPayments={gamesPayments}
              locations={locations}
              isReviewMode={isReviewMode}
              theme={theme}
              worker={salary.worker}
              dates={salary.dates}
              workTypes={workTypes}
              workerId={worker.id}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
