'use client'

import {
  LTLocation,
  LTMoneyOnLocationsData,
  LTPayroll,
  LTWorkerPayrollData,
} from '@/src/utils/types'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import checkPermissions from '@/lib/functions/checkPermissions'
import {Button, Code, Divider, Link} from '@heroui/react'
import Location from '@/src/components/global/Location'
import {ArrowLeft} from 'solar-icon-set'
import PayrollsDetailsRow from '@/src/components/payrolls/details/PayrollsDetailsRow'
import PayrollsDetailsHeader from '@/src/components/payrolls/details/PayrollsDetailsHeader'
import {io, Socket} from 'socket.io-client'

interface PayrollsDetailsPageProps {
  data: LTWorkerPayrollData[]
  locationsData: LTMoneyOnLocationsData[]
  locations: LTLocation[]
  payroll: LTPayroll
}

export default function PayrollsDetailsPage({
  data: initialData,
  locationsData,
  locations,
  payroll,
}: PayrollsDetailsPageProps) {
  const [data, setData] = useState<LTWorkerPayrollData[]>(initialData)
  const socketRef = useRef<Socket | null>(null)
  const {worker, setExiting} = useAuth()

  useEffect(() => {
    setExiting(false)
  }, [setExiting])

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
  }, [checkTarget, worker.id])

  return (
    <main className="h-full w-full overflow-x-auto p-4">
      <div className="flex items-center gap-2 pb-4">
        <Button as={Link} href="/payrolls" startContent={<ArrowLeft />}>
          Назад
        </Button>
      </div>
      <div className="flex gap-4">
        <div className="bg-content1 flex w-full flex-col gap-2 rounded-2xl">
          <PayrollsDetailsHeader canIssue={canIssue} />
          <div className="flex flex-col gap-2">
            {data.map((item, index) => {
              return (
                <PayrollsDetailsRow
                  socketRef={socketRef}
                  payrollId={payroll.id}
                  lastRow={index === data.length - 1}
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
        {checkPermissions(
          ['view_all_payrolls', 'view_location_payrolls'],
          worker,
        ) && (
          <div className="sticky top-0 flex h-fit min-w-[22rem] flex-col gap-2">
            <div className="glass grid auto-rows-auto grid-cols-3 gap-2 rounded-2xl p-2">
              <p className="text-center">Локация</p>
              <Code color="primary" className="text-center">
                Выделено
              </Code>
              <Code color="success" className="text-center">
                Выдано
              </Code>
              {locationsData.map((locationData, index) => {
                const locationIssued = data
                  .filter(d => d.location_id === locationData.location_id)
                  .reduce((acc, cur) => acc + (cur.taken || 0), 0)

                return (
                  <Fragment key={index}>
                    <Divider className="col-span-full" />
                    <Location
                      className="break-all"
                      locationName={locationData.location}
                    />
                    <Code color="primary">{locationData.value}</Code>
                    <Code color="success">{locationIssued}</Code>
                  </Fragment>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
