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
import {DateTime, Interval} from 'luxon'
import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  Spinner,
  TextField,
  Label,
} from '@heroui/react'
import MonthSelect from '@/src/components/salary/MonthSelect'
import LocationSelect from '@/src/components/global/LocationSelect'
import fetchHandler from '@/src/utils/global/fetchHandler'
import useIsMobile from '@/src/hooks/useIsMobile'
import checkPermissions from '@/lib/functions/checkPermissions'
import {useAtomValue} from 'jotai'
import {headerSizesAtom} from '@/src/utils/global/atoms'
import {useTheme} from 'next-themes'
import SalaryRow from '@/src/components/salary/SalaryRow'
import SalaryDaysRow from '@/src/components/salary/SalaryDaysRow'
import unaccent from '@/lib/functions/unaccent'
import Excel from '@/public/icons/Excel'
import {Icon} from '@iconify/react'

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
    const datetime = DateTime.fromFormat(date, 'yyyy-MM-dd')
    const month = datetime.toFormat('MM')

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

  const download = useCallback(async () => {
    const datetime = DateTime.fromFormat(date, 'yyyy-MM-dd').setZone(
      'Europe/Moscow',
    )

    console.debug(datetime.toISO())

    const start = datetime.startOf('month')
    const end = datetime.endOf('month')

    console.debug(start.toString(), end.toString(), start.toISO())

    const response = await fetch('/api/excel', {
      method: 'POST',
      body: JSON.stringify({
        start_date: start.toString(),
        end_date: end.toString(),
        type: 'salary',
      }),
    })

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    const interval = Interval.fromDateTimes(start, end)

    let name = `Сводная сотрудников (${interval.toFormat('dd.MM.yyyy')})`

    a.download = `${name}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }, [date])

  return (
    <main className="h-fit">
      <div className="relative h-full w-full">
        <div
          ref={wrapperRef}
          style={{
            left: `${headerSizes.width}px`,
          }}
          className="bg-surface sticky top-2 z-1000 mb-4 flex h-22 w-dvw flex-wrap items-center gap-2 rounded-2xl p-4 text-xl font-bold">
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
              <Dropdown>
                <Dropdown.Trigger>
                  <Button slot="icon" variant="tertiary" isIconOnly>
                    <Icon icon="solar:filter-bold" width="24" height="24" />
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Menu className="min-w-40">
                  <Dropdown.Item key="location">
                    <LocationSelect
                      labelPlacement="inside"
                      includeAll={true}
                      className="w-fit"
                      callback={(location: LTLocation | LTLocation[] | null) =>
                        updateData('location', location as LTLocation)
                      }
                      dynamicLocationId
                      locationId={locationId}
                    />
                  </Dropdown.Item>
                  <Dropdown.Item key="name">
                    <TextField
                      variant="secondary"
                      className="w-fit"
                      onChange={handleNameFilter}>
                      <Label>Позывной</Label>
                      <Input className="w-fit" />
                    </TextField>
                  </Dropdown.Item>
                  <Dropdown.Item key="hide">
                    <Checkbox
                      variant="secondary"
                      id="hide"
                      className="border-surface-foreground/20 h-full rounded-2xl border-2 px-2"
                      isSelected={isReviewMode}
                      onChange={value => {
                        handleHideFilter(value)
                      }}>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Content>
                        <Label htmlFor="hide">Скрыть пустые</Label>
                      </Checkbox.Content>
                    </Checkbox>
                  </Dropdown.Item>
                  {canViewFull ? (
                    <Checkbox
                      variant="secondary"
                      id="check"
                      className="border-surface-foreground/20 h-full rounded-2xl border-2 px-2"
                      isSelected={isReviewMode}
                      onChange={value => {
                        setReviewMode(value)
                        localStorage.setItem('salaryReview', `${value}`)
                      }}>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Content>
                        <Label htmlFor="check">Проверка</Label>
                      </Checkbox.Content>
                    </Checkbox>
                  ) : null}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <LocationSelect
                  labelPlacement="inside"
                  includeAll={true}
                  className="w-fit"
                  callback={(location: LTLocation | LTLocation[] | null) =>
                    updateData('location', location as LTLocation)
                  }
                  dynamicLocationId
                  locationId={locationId}
                />
                <TextField
                  variant="secondary"
                  className="w-fit"
                  onChange={handleNameFilter}>
                  <Label>Позывной</Label>
                  <Input className="w-fit" />
                </TextField>
                <Checkbox
                  variant="secondary"
                  id="hide"
                  className="border-surface-foreground/20 h-full rounded-2xl border-2 px-2"
                  isSelected={hideEmptyFilter}
                  onChange={value => {
                    handleHideFilter(value)
                  }}>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label htmlFor="hide">Скрыть пустые</Label>
                  </Checkbox.Content>
                </Checkbox>
                {canViewFull && (
                  <Checkbox
                    variant="secondary"
                    id="check"
                    className="border-surface-foreground/20 h-full rounded-2xl border-2 px-2"
                    isSelected={isReviewMode}
                    onChange={value => {
                      setReviewMode(value)
                      localStorage.setItem('salaryReview', `${value}`)
                    }}>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content>
                      <Label htmlFor="check">Проверка</Label>
                    </Checkbox.Content>
                  </Checkbox>
                )}
              </>
            ))}
          {loading && (
            <>
              <Spinner /> Загрузка
            </>
          )}
          {canViewFull && (
            <Button
              slot="icon"
              className="h-fit"
              variant="tertiary"
              onPress={() => download()}>
              <Excel width={32} height={32} />
              Скачать сводную
            </Button>
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
