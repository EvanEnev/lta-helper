'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {io, Socket} from 'socket.io-client'
import checkPermissions from '@/lib/functions/checkPermissions'
import unaccent from '@/lib/functions/unaccent'
import {cn} from '@/lib/utils'
import type {
  LTLocation,
  LTMoneyOnLocationsData,
  LTPayroll,
  LTWorker,
  LTWorkerPayrollData,
} from '@/src/utils/types'
import DetailsMoney from './DetailsMoney'
import DetailsRow, {type RowPatch} from './DetailsRow'
import DetailsToolbar, {type StatusFilter} from './DetailsToolbar'

interface PayrollsDetailsPageProps {
  payrollId: number
  data: LTWorkerPayrollData[]
  locationsData: LTMoneyOnLocationsData[]
  locations: LTLocation[]
  payroll: LTPayroll
  worker: LTWorker
}

// Событие workers_payrolls:update из триггера БД: to_take_by и taken_by приходят
// именами (текстом), а не объектами; номера ведомости в нём нет
interface PayrollUpdate {
  worker_id: number
  value: number
  bonuses: number | null
  location_id: number
  to_take_by: string | null
  to_take: number | null
  issue_confirmed: boolean | null
  taken_by: string | null
  taken: number | null
  external_payment: number | null
  taken_at: string | null
}

const ALL: LTLocation = {
  id: 0,
  name: 'Все',
  shortName: 'Все',
  color: '',
  konsol_id: null,
}

// после своей правки эхо события ещё какое-то время не перезаписывает числа
const ECHO_MS = 1500

export default function PayrollsDetailsPage({
  payrollId,
  data: initialData,
  locationsData,
  locations,
  worker,
}: PayrollsDetailsPageProps) {
  const [data, setData] = useState(initialData)
  const dataRef = useRef(data)
  const socketRef = useRef<Socket | null>(null)
  const recentEdits = useRef(new Map<number, number>())

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [locationFilter, setLocationFilter] = useState(0)
  const [moneyOpen, setMoneyOpen] = useState(false)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  const canIssue = useMemo(
    () => checkPermissions(['issue_payrolls'], worker),
    [worker],
  )
  const canEdit = useMemo(
    () => checkPermissions(['edit_payrolls'], worker),
    [worker],
  )
  const canSeeSummary =
    checkPermissions(['view_all_payrolls', 'view_location_payrolls'], worker) &&
    locationsData.length !== 0

  useEffect(() => {
    const socket = io()
    socketRef.current = socket

    socket.on('workers_payrolls:update', (payload: PayrollUpdate) => {
      const mine =
        Date.now() - (recentEdits.current.get(payload.worker_id) ?? 0) < ECHO_MS

      setData(prev =>
        prev.map(row => {
          if (row.worker.id !== payload.worker_id) return row

          return {
            ...row,
            // числа, которые пользователь только что менял, не затираем эхом
            ...(mine
              ? {}
              : {
                  value: payload.value,
                  bonuses: payload.bonuses,
                  external_payment: payload.external_payment,
                  location_id: payload.location_id,
                }),
            to_take: payload.to_take,
            issue_confirmed: payload.issue_confirmed,
            taken: payload.taken,
            taken_at: payload.taken_at,
            to_take_by: {
              name: payload.to_take_by,
              rank:
                row.to_take_by?.name === payload.to_take_by
                  ? row.to_take_by.rank
                  : null,
            },
            taken_by: {
              name: payload.taken_by,
              rank:
                row.taken_by?.name === payload.taken_by
                  ? row.taken_by.rank
                  : null,
            },
          }
        }),
      )
    })

    return () => {
      socket.off('workers_payrolls:update')
      socket.disconnect()
    }
  }, [])

  // Правка: числа применяются сразу, на сервер уходят ВСЕ четыре поля. Раньше
  // external_payment отправлялся только при его правке, и правка суммы, бонусов
  // или локации стирала внешнюю выплату; очищенное поле записывалось как -1
  const edit = useCallback(
    (workerId: number, patch: RowPatch) => {
      const row = dataRef.current.find(r => r.worker.id === workerId)
      if (!row) return

      const next = {
        value: row.value,
        bonuses: row.bonuses,
        external_payment: row.external_payment,
        location_id: row.location_id,
        ...patch,
      }

      recentEdits.current.set(workerId, Date.now())
      setData(prev =>
        prev.map(r => (r.worker.id === workerId ? {...r, ...next} : r)),
      )

      socketRef.current?.emit('update:workers_payrolls', {
        worker_id: workerId,
        payroll_id: payrollId,
        ...next,
      })
    },
    [payrollId],
  )

  const filtered = useMemo(() => {
    const text = unaccent(query.toLowerCase())

    return data.filter(row => {
      if (text && !row.worker._searchName.startsWith(text)) return false
      if (locationFilter !== 0 && row.location_id !== locationFilter)
        return false

      if (status === 'none') return !row.issue_confirmed && !row.taken
      if (status === 'confirmed') return !!row.issue_confirmed
      if (status === 'issued') return !!row.taken

      return true
    })
  }, [data, query, status, locationFilter])

  const locationOptions = useMemo(() => [ALL, ...locations], [locations])

  return (
    <main
      className={cn(
        'flex min-w-0 flex-col gap-3 p-4',
        'max-sm:h-[calc(100dvh-4rem)] sm:h-dvh',
      )}>
      {canSeeSummary && (
        <div className="flex shrink-0 flex-col gap-3">
          <DetailsToolbar
            payrollId={payrollId}
            data={data}
            locationsData={locationsData}
            locationOptions={locationOptions}
            locationName={
              locationOptions.find(l => l.id === locationFilter)?.name ?? 'Все'
            }
            onLocationChange={name =>
              setLocationFilter(
                locationOptions.find(l => l.name === name)?.id ?? 0,
              )
            }
            query={query}
            onQueryChange={setQuery}
            status={status}
            onStatusChange={setStatus}
            moneyOpen={moneyOpen}
            onMoneyToggle={() => setMoneyOpen(open => !open)}
            canEdit={canEdit}
          />
          {moneyOpen && locationsData.length > 1 && (
            <div className="max-h-64 overflow-y-auto">
              <DetailsMoney locationsData={locationsData} data={data} />
            </div>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto [contain:inline-size]">
        {filtered.map(row => (
          <DetailsRow
            key={row.worker.id}
            data={row}
            payrollId={payrollId}
            canIssue={canIssue}
            canEdit={canEdit}
            locations={locations}
            sessionLocationId={worker.locationId}
            onEdit={edit}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground py-12 text-center text-sm">
            Никого не найдено
          </p>
        )}
      </div>
    </main>
  )
}
