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
import PayrollsDetailsNote from '@/src/components/payrolls/details/PayrollsDetailsNote'

interface PayrollsDetailsPageProps {
  data: LTWorkerPayrollData[]
  locationsData: LTMoneyOnLocationsData[]
  locations: LTLocation[]
  payroll: LTPayroll
  worker: LTWorker
}

export default function PayrollsDetailsPage({
  data: initialData,
  locationsData,
  locations,
  payroll,
  worker,
}: PayrollsDetailsPageProps) {
  const [data, setData] = useState<LTWorkerPayrollData[]>(initialData)
  const unfilteredData = useRef(initialData)
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

      unfilteredData.current = data.map((row: any) => {
        if (!checkTarget(row, data)) return row
        return {
          ...row,
          ...data,
        }
      })
    })

    return () => {
      socket.off('workers_payrolls:update')
      socket.disconnect()
    }
  }, [checkTarget, worker?.id])

  const locationSelectCallback = useCallback((location: LTLocation | null) => {
    if (!location) return setData(unfilteredData.current)

    setData(unfilteredData.current.filter(d => d.location_id === location.id))
  }, [])

  return (
    <main className="flex h-full w-full gap-2 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex h-fit w-full flex-col gap-2 rounded-2xl">
          <div className="flex flex-col gap-2">
            {data.map((item, index) => {
              return (
                <PayrollsDetailsRow
                  worker={worker}
                  socketRef={socketRef}
                  payrollId={payroll.id}
                  key={index}
                  data={item}
                  canIssue={canIssue}
                  canEdit={canEdit}
                  locations={locations}
                />
              )
            })}
          </div>
        </div>
      </div>
      {checkPermissions(
        ['view_all_payrolls', 'view_location_payrolls'],
        worker,
      ) && (
        <PayrollsDetailsNote
          locationsData={locationsData}
          locationSelectCallback={locationSelectCallback}
          data={data}
        />
      )}
    </main>
  )
}
