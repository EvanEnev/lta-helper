'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import dynamic from 'next/dynamic'
import {io, Socket} from 'socket.io-client'
import {DateTime, Interval} from 'luxon'
import {Skeleton} from '@/components/ui/skeleton'
import {cn} from '@/lib/utils'
import {useIsMobile} from '@/hooks/use-mobile'
import checkPermissions from '@/lib/functions/checkPermissions'
import unaccent from '@/lib/functions/unaccent'
import fetchHandler from '@/src/utils/global/fetchHandler'
import type {
  LTGamePayment,
  LTLocation,
  LTWorker,
  SalaryData,
  UserSalary,
} from '@/src/utils/types'
import SalaryCalendar from './SalaryCalendar'
import SalaryList from './SalaryList'
import SalaryTable from './SalaryTable'
import SalaryToolbar from './SalaryToolbar'
import {
  ZONE,
  applyRemoteUpdate,
  dayKeys,
  editKey,
  indexByDay,
  monthStart,
  removeDay,
  replaceDay,
  todayKey,
  type SalaryUpdatePayload,
  visibleLocations,
} from './utils'

// Панель деталей с формами нужна только после первого клика по ячейке
const DetailsSheet = dynamic(() => import('./DetailsSheet'), {ssr: false})

interface SalaryPageProps {
  worker: LTWorker
  canViewFull: boolean
  canEdit: boolean
  dates: string[]
  gamesPayments: LTGamePayment[]
  locations: LTLocation[]
}

const ALL_LOCATIONS: LTLocation = {
  id: 0,
  name: 'Все',
  shortName: 'Все',
  color: '',
  konsol_id: null,
}

// Свои правки по сокету вернутся эхом - в течение этого времени их пропускаем
const ECHO_MS = 2000

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

export default function SalaryPage({
  worker,
  canViewFull,
  canEdit,
  dates: availableMonths,
  gamesPayments,
  locations,
}: SalaryPageProps) {
  const isMobile = useIsMobile()

  const canViewLocation = useMemo(
    () =>
      checkPermissions(['view_location_salary', 'view_full_salary'], worker),
    [worker],
  )

  // месяцы приходят от новых к старым; по умолчанию - текущий, иначе самый свежий
  const months = useMemo(
    () =>
      availableMonths.map(iso => DateTime.fromISO(iso).toFormat('yyyy-MM-dd')),
    [availableMonths],
  )
  const defaultMonth = useMemo(() => {
    const current = DateTime.now().setZone(ZONE).startOf('month')

    return (
      months.find(m => monthStart(m).hasSame(current, 'month')) ??
      months[0] ??
      current.toFormat('yyyy-MM-dd')
    )
  }, [months])

  // сохранённый выбор читаем после монтирования: на сервере localStorage нет
  const [ready, setReady] = useState(false)
  const [month, setMonth] = useState(defaultMonth)
  const [locationId, setLocationId] = useState<number>(worker.locationId || 2)
  const [review, setReview] = useState(false)
  // «Подробно» - все поля в ячейке (для проверок), «Кратко» - сумма и значки
  const [density, setDensity] = useState<'full' | 'compact'>('full')

  useEffect(() => {
    const storedMonth = readStorage('salaryDate')
    const storedLocation = readStorage('salaryLocationId')

    if (storedMonth) setMonth(storedMonth)
    if (storedLocation) setLocationId(parseInt(storedLocation))
    if (canViewFull && readStorage('salaryReview') === 'true') setReview(true)
    if (readStorage('salaryDensity') === 'compact') setDensity('compact')

    setReady(true)
  }, [canViewFull])

  const [rows, setRows] = useState<UserSalary[]>([])
  const [isLoading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [hideEmpty, setHideEmpty] = useState(false)
  const [selected, setSelected] = useState<{
    workerId: number
    dayKey: string
  } | null>(null)
  const [sheetUsed, setSheetUsed] = useState(false)
  const [scrollSignal, setScrollSignal] = useState(0)

  // ---------- загрузка ----------
  const requestId = useRef(0)

  const load = useCallback(
    async (silent: boolean) => {
      const id = ++requestId.current
      if (!silent) setLoading(true)

      try {
        const json = await fetchHandler({
          url: '/api/salary/getData',
          body: {
            locationId: locationId || 1,
            date: month,
            allLocations: locationId === 0,
          },
          showNotification: false,
        })

        // ответ на устаревший запрос (сменили месяц или локацию) отбрасываем
        if (id === requestId.current && json?.data) setRows(json.data)
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    },
    [month, locationId],
  )

  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  }, [load])

  useEffect(() => {
    if (ready) load(false)
  }, [ready, load])

  // ---------- сокет ----------
  const socketRef = useRef<Socket | null>(null)
  const locationRef = useRef(locationId)
  const monthRef = useRef(month)
  const recentEdits = useRef(new Map<string, number>())
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    locationRef.current = locationId
    monthRef.current = month
  }, [locationId, month])

  useEffect(() => {
    const socket = io()
    socketRef.current = socket

    // Обработчик не зависит от состояния: данные берём из prev
    socket.on('salary:update', (payload: SalaryUpdatePayload) => {
      const key = editKey(payload.worker_id, payload.date, payload.location?.id)
      const editedAt = recentEdits.current.get(key)
      if (editedAt && Date.now() - editedAt < ECHO_MS) return

      if (locationRef.current && payload.location?.id !== locationRef.current) {
        return
      }

      // чужой месяц нам не интересен
      if (!payload.date.startsWith(monthRef.current.slice(0, 7))) return

      let found = true
      setRows(prev => {
        const result = applyRemoteUpdate(prev, payload)
        found = result.found
        return result.rows
      })

      // Новая смена, которой в таблице ещё нет: тихо перечитываем данные
      // (к моменту срабатывания таймера обновление состояния уже выполнено)
      if (reloadTimer.current) clearTimeout(reloadTimer.current)
      reloadTimer.current = setTimeout(() => {
        if (!found) loadRef.current(true)
      }, 800)
    })

    return () => {
      socket.off('salary:update')
      socket.disconnect()
      if (reloadTimer.current) clearTimeout(reloadTimer.current)
    }
  }, [])

  // свои правки вернутся событием БД: запоминаем и пропускаем
  const markEdited = (workerId: number, data: SalaryData) => {
    const iso = DateTime.fromFormat(data.date, 'dd.MM.yyyy').toFormat(
      'yyyy-MM-dd',
    )

    recentEdits.current.set(
      editKey(workerId, iso, data.location?.id),
      Date.now(),
    )
  }

  const handleEdit = useCallback(
    (data: SalaryData, workerId: number) => {
      markEdited(workerId, data)
      setRows(prev => replaceDay(prev, workerId, data))

      socketRef.current?.emit('update:user_salary', {
        ...data,
        updated_by: worker.id,
      })
    },
    [worker.id],
  )

  const handleDelete = useCallback(
    (data: SalaryData) => {
      setRows(prev => removeDay(prev, data.id))
      setSelected(null)

      socketRef.current?.emit('update:user_salary', {
        ...data,
        delete: true,
        updated_by: worker.id,
      })
    },
    [worker.id],
  )

  const handleOpen = useCallback((workerId: number, dayKey: string) => {
    setSheetUsed(true)
    setSelected({workerId, dayKey})
  }, [])

  // ---------- производные данные ----------
  const days = useMemo(() => dayKeys(month), [month])
  const isCurrentMonth = monthStart(month).hasSame(
    DateTime.now().setZone(ZONE),
    'month',
  )
  const today = isCurrentMonth ? todayKey() : null

  const filtered = useMemo(() => {
    const text = unaccent(query).toLowerCase().trim()

    return rows.filter(
      row =>
        (!text ||
          unaccent(row.worker.name).toLowerCase().includes(text) ||
          unaccent(row.worker.firstName ?? '')
            .toLowerCase()
            .includes(text)) &&
        (!hideEmpty || row.dates.length > 0),
    )
  }, [rows, query, hideEmpty])

  const locationOptions = useMemo(() => {
    const list = visibleLocations(locations, worker, canViewFull)

    return canViewFull ? [ALL_LOCATIONS, ...list] : list
  }, [locations, worker, canViewFull])

  const locationName =
    locationOptions.find(l => l.id === locationId)?.name ?? ''

  const target = useMemo(() => {
    if (!selected) return null

    const row = rows.find(r => r.worker.id === selected.workerId)
    const data = row && indexByDay(row.dates).get(selected.dayKey)

    return row && data ? {worker: row.worker, data} : null
  }, [rows, selected])

  // ---------- действия ----------
  const changeMonth = (next: string) => {
    writeStorage('salaryDate', next)
    setMonth(next)
  }

  const changeLocation = (name: string) => {
    const location = locationOptions.find(l => l.name === name)
    if (!location) return

    if (location.id !== 0) writeStorage('salaryLocationId', String(location.id))
    setLocationId(location.id)
  }

  const changeReview = (value: boolean) => {
    writeStorage('salaryReview', String(value))
    setReview(value)
  }

  const changeDensity = (value: 'full' | 'compact') => {
    writeStorage('salaryDensity', value)
    setDensity(value)
  }

  const download = useCallback(async () => {
    const start = DateTime.fromFormat(month, 'yyyy-MM-dd')
      .setZone(ZONE)
      .startOf('month')
    const end = start.endOf('month')

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
    const link = document.createElement('a')
    const name = `Сводная сотрудников (${Interval.fromDateTimes(start, end).toFormat('dd.MM.yyyy')})`

    link.href = url
    link.download = `${name}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }, [month])

  const isTable = canViewLocation

  return (
    <main
      className={cn(
        'flex min-w-0 flex-col gap-3 p-4',
        // таблица занимает ровно высоту экрана (на телефоне минус нижняя панель)
        isTable && 'max-sm:h-[calc(100dvh-4rem)] sm:h-dvh',
      )}>
      <SalaryToolbar
        months={availableMonths}
        month={month}
        onMonthChange={changeMonth}
        locations={locationOptions}
        locationName={locationName}
        onLocationChange={changeLocation}
        canViewLocation={canViewLocation}
        canViewFull={canViewFull}
        query={query}
        onQueryChange={setQuery}
        hideEmpty={hideEmpty}
        onHideEmptyChange={setHideEmpty}
        review={review}
        onReviewChange={changeReview}
        density={density}
        onDensityChange={changeDensity}
        isLoading={isLoading && ready}
        showToday={isTable && isCurrentMonth}
        onToday={() => setScrollSignal(n => n + 1)}
        onDownload={download}
      />

      {!ready || (isLoading && rows.length === 0) ? (
        <div className="flex flex-col gap-2">
          {Array.from({length: 6}, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isTable ? (
        filtered.length ? (
          <SalaryTable
            rows={filtered}
            days={days}
            today={today}
            review={review}
            density={density}
            scrollSignal={scrollSignal}
            monthKey={month}
            isLoading={isLoading}
            onOpen={handleOpen}
          />
        ) : (
          <p className="text-muted-foreground py-12 text-center text-sm">
            Ничего не найдено
          </p>
        )
      ) : density === 'full' ? (
        <SalaryList
          row={rows.find(r => r.worker.id === worker.id) ?? rows[0]}
          date={month}
          today={today}
          review={review}
          onOpen={handleOpen}
        />
      ) : (
        <SalaryCalendar
          row={rows.find(r => r.worker.id === worker.id) ?? rows[0]}
          date={month}
          today={today}
          review={review}
          onOpen={handleOpen}
        />
      )}

      {sheetUsed && (
        <DetailsSheet
          target={target}
          canEdit={canEdit}
          side={isMobile ? 'bottom' : 'right'}
          gamesPayments={gamesPayments}
          locations={locations}
          onClose={() => setSelected(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </main>
  )
}
