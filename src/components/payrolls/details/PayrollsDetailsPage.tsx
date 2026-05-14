'use client'

import {
  LTLocation,
  LTMoneyOnLocationsData,
  LTPayroll,
  LTWorker,
  LTWorkerPayrollData,
} from '@/src/utils/types'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import checkPermissions from '@/lib/functions/checkPermissions'
import PayrollsDetailsRow from '@/src/components/payrolls/details/PayrollsDetailsRow'
import {io, Socket} from 'socket.io-client'
import PayrollsDetailsHeader from '@/src/components/payrolls/details/PayrollsDetailsHeader'

interface PayrollsDetailsPageProps {
  payrollId: number
  data: LTWorkerPayrollData[]
  locationsData: LTMoneyOnLocationsData[]
  locations: LTLocation[]
  payroll: LTPayroll
  worker: LTWorker
}

interface Filter {
  name: string
  value: string | number | LTLocation | LTLocation[] | null
}

export default function PayrollsDetailsPage({
  payrollId,
  data: initialData,
  locationsData,
  locations,
  payroll,
  worker,
}: PayrollsDetailsPageProps) {
  const [filters, setFilters] = useState<Filter[]>([])
  const [data, setData] = useState<LTWorkerPayrollData[]>(initialData)
  const socketRef = useRef<Socket | null>(null)

  const canIssue = useMemo(
    () => checkPermissions(['issue_payrolls'], worker),
    [worker],
  )

  const canEdit = useMemo(
    () => checkPermissions(['edit_payrolls'], worker),
    [worker],
  )

  const checkTarget = useCallback((row: LTWorkerPayrollData, data: any) => {
    return row.worker.id === data.worker_id
  }, [])

  useEffect(() => {
    const socket = io()

    socketRef.current = socket

    socket.on('workers_payrolls:update', (data: any) => {
      setData(prev =>
        prev.map(row => {
          if (!checkTarget(row, data)) return row
          return {
            ...row,
            ...data,
          }
        }),
      )
    })

    return () => {
      socket.off('workers_payrolls:update')
      socket.disconnect()
    }
  }, [checkTarget, worker?.id])

  const filteredData = useMemo(() => {
    let result = data

    for (const filter of filters) {
      if (!filter.value) continue

      switch (filter.name) {
        case 'name': {
          const value = String(filter.value)
          result = result.filter(d => d.worker._searchName.startsWith(value))
          break
        }

        case 'status': {
          const value = filter.value

          if (value === 1) {
            result = result.filter(d => !d.issue_confirmed && !d.taken)
          } else if (value === 2) {
            result = result.filter(d => d.issue_confirmed)
          } else if (value === 3) {
            result = result.filter(d => !!d.taken)
          }
          break
        }

        case 'location': {
          const id = (filter.value as LTLocation).id
          result = result.filter(d => d.location_id === id)
          break
        }
      }
    }

    return result
  }, [data, filters])

  const filterChangeCallback = useCallback(
    (name: Filter['name'], value: Filter['value']) => {
      setFilters(prev => {
        const existingFilter = prev.find(d => d.name === name)

        if (existingFilter) {
          if (!value) {
            return prev.filter(d => d.name !== name)
          }

          return prev.map(d => (d.name === name ? {...d, value} : d))
        }

        return [...prev, {name, value}]
      })
    },
    [],
  )

  return (
    <main className="flex h-full w-full gap-2 p-4">
      <div className="flex h-fit w-full flex-col gap-2">
        {checkPermissions(
          ['view_all_payrolls', 'view_location_payrolls'],
          worker,
        ) && (
          <PayrollsDetailsHeader
            payrollId={payrollId}
            filterChangeCallback={filterChangeCallback}
            locationsData={locationsData}
            data={data}
            canEdit={canEdit}
          />
        )}
        {filteredData.map(item => {
          return (
            <PayrollsDetailsRow
              worker={worker}
              socketRef={socketRef}
              payrollId={payroll.id}
              key={item.worker.id}
              data={item}
              canIssue={canIssue}
              canEdit={canEdit}
              locations={locations}
            />
          )
        })}
      </div>
    </main>
  )
}
