import {LTLocation, LTPayroll, LTWorkerPayrollData} from '@/src/utils/types'
import RankIcon from '@/src/components/global/RankIcon'
import {Button, Divider, NumberInput} from '@heroui/react'
import {DateTime} from 'luxon'
import LocationSelect from '@/src/components/global/LocationSelect'
import {Ruble} from 'solar-icon-set'
import {RefObject, useCallback, useState} from 'react'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {Socket} from 'socket.io-client'
import {DefaultEventsMap} from 'socket.io'
import supabase from '@/lib/supabase'

interface PayrollsDetailsRowProps {
  data: LTWorkerPayrollData
  canIssue: boolean
  locations: LTLocation[]
  lastRow: boolean
  canEdit: boolean
  socketRef: RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>
  payrollId: LTPayroll['id']
}

export default function PayrollsDetailsRow({
  data,
  canIssue,
  locations,
  lastRow,
  canEdit,
  payrollId,
  socketRef,
}: PayrollsDetailsRowProps) {
  const [loading, setLoading] = useState(false)

  const issuePayroll = useCallback(async () => {
    setLoading(true)
    const body = {
      worker_id: data.worker.id,
      value: data.to_take,
      payroll_id: payrollId,
    }

    await fetchHandler({url: '/api/payrolls/issue', body, method: 'POST'})
    setLoading(false)
  }, [data.to_take, data.worker.id, payrollId])

  const updateCallback = useCallback(
    async (
      key: 'location_id' | 'value' | 'bonuses' | 'external_payment',
      value: number | null,
    ) => {
      if (!value) value = -1
      const session = await supabase.auth.getSession()

      const body = {
        worker_id: data.worker.id,
        payroll_id: payrollId,
        value: data.value,
        bonuses: data.bonuses,
        location_id: data.location_id,
        [key]: value,
        auth: session?.data.session?.access_token,
      }

      socketRef.current?.emit('update:workers_payrolls', body)
    },
    [
      data.bonuses,
      data.location_id,
      data.value,
      data.worker.id,
      payrollId,
      socketRef,
    ],
  )

  return (
    <>
      <div className="flex items-center gap-2 rounded-2xl p-2">
        <div className="flex min-w-[9rem] flex-1 items-center justify-start gap-2">
          <RankIcon rank={data.worker.rank} />
          <p className="mx-auto">{data.worker.name}</p>
        </div>
        <Divider orientation="vertical" />
        <NumberInput
          isReadOnly={!canEdit}
          onValueChange={(value: number) => {
            updateCallback('value', value)
          }}
          isWheelDisabled
          endContent={<Ruble iconStyle="Bold" />}
          className="min-w-[9rem] flex-1"
          defaultValue={data.value || 0}
        />
        <Divider orientation="vertical" />
        <NumberInput
          isReadOnly={!canEdit}
          isWheelDisabled
          minValue={0}
          onValueChange={(value: number) => {
            updateCallback('bonuses', value)
          }}
          endContent={<Ruble iconStyle="Bold" />}
          className="min-w-[9rem] flex-1"
          defaultValue={data.bonuses || 0}
        />
        <Divider orientation="vertical" />
        <NumberInput
          isReadOnly={!canEdit}
          isWheelDisabled
          minValue={0}
          onValueChange={(value: number) => {
            updateCallback('external_payment', value)
          }}
          endContent={<Ruble iconStyle="Bold" />}
          className="min-w-[9rem] flex-1"
          defaultValue={data.external_payment || 0}
        />
        <Divider orientation="vertical" />
        <LocationSelect
          isClearable
          isReadOnly={!canEdit}
          className="h-14 min-w-[9rem] flex-1"
          callback={location => {
            updateCallback('location_id', location?.id || null)
          }}
          locationId={data.location_id}
          showLabel={false}
          locations={locations}
        />
        <Divider orientation="vertical" />
        <div className="flex min-w-[9rem] flex-1 flex-col gap-1 text-center">
          <p>{data.taken_by}</p>
          <p>
            {data.taken_at &&
              DateTime.fromFormat(
                data.taken_at,
                'yyyy-MM-dd HH:mm:ss',
              ).toFormat('dd.MM.yyyy HH:mm:ss')}
          </p>
          <p>{data.taken}</p>
        </div>
        <Divider orientation="vertical" />
        <p className="min-w-[9rem] flex-1 text-center">
          {data.value - (data.taken || 0) - (data.external_payment || 0)}
        </p>
        {canIssue && (
          <>
            <Divider orientation="vertical" />
            <p className="min-w-[9rem] flex-1 text-center">{data.to_take}</p>
            <Divider orientation="vertical" />
            <p className="min-w-[9rem] flex-1 text-center">{data.to_take_by}</p>
            <Divider orientation="vertical" />
            <div className="`flex-1 min-w-[9rem]">
              <Button
                isLoading={loading}
                onPress={issuePayroll}
                className="w-full"
                color={
                  data.issue_confirmed
                    ? 'primary'
                    : data.taken
                      ? 'success'
                      : 'default'
                }
                isDisabled={!data.issue_confirmed}>
                Выдать
              </Button>
            </div>
          </>
        )}
      </div>
      <Divider hidden={lastRow} />
    </>
  )
}
