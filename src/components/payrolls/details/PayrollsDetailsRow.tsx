import {LTLocation, LTPayroll, LTWorkerPayrollData} from '@/src/utils/types'
import RankIcon from '@/src/components/global/RankIcon'
import {Button, Code, Divider, NumberInput} from '@heroui/react'
import {DateTime} from 'luxon'
import LocationSelect from '@/src/components/global/LocationSelect'
import {Ruble} from 'solar-icon-set'
import {RefObject, useCallback, useState} from 'react'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {Socket} from 'socket.io-client'
import {DefaultEventsMap} from 'socket.io'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {authClient} from '@/lib/auth/authClient'

interface PayrollsDetailsRowProps {
  data: LTWorkerPayrollData
  canIssue: boolean
  locations: LTLocation[]
  canEdit: boolean
  socketRef: RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>
  payrollId: LTPayroll['id']
}

export default function PayrollsDetailsRow({
  data,
  canIssue,
  locations,
  canEdit,
  payrollId,
  socketRef,
}: PayrollsDetailsRowProps) {
  const {worker} = useAuth()
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
      const session = await authClient.getSession()
      console.debug(session)

      const body = {
        worker_id: data.worker.id,
        payroll_id: payrollId,
        value: data.value,
        bonuses: data.bonuses,
        location_id: data.location_id,
        [key]: value,
        auth: session.data?.session.token,
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
      <fieldset className="glass relative flex flex-col items-center gap-2 rounded-2xl p-2">
        <legend className="sticky left-2 flex translate-y-1 items-center justify-start gap-2">
          <RankIcon rank={data.worker.rank} />
          <p className="mx-auto">{data.worker.name}</p>
        </legend>
        <div className="flex items-center gap-2">
          <NumberInput
            label="Ставка"
            labelPlacement="outside"
            classNames={{stepperButton: 'hidden'}}
            isReadOnly={!canEdit}
            onValueChange={(value: number) => {
              updateCallback('value', value)
            }}
            isWheelDisabled
            endContent={<Ruble iconStyle="Bold" />}
            className="min-w-[9rem] flex-1"
            value={data.value || 0}
          />
          <Divider orientation="vertical" />
          <NumberInput
            label="Бонусы"
            labelPlacement="outside"
            classNames={{stepperButton: 'hidden'}}
            isReadOnly={!canEdit}
            isWheelDisabled
            onValueChange={(value: number) => {
              updateCallback('bonuses', value)
            }}
            endContent={<Ruble iconStyle="Bold" />}
            className="min-w-[9rem] flex-1"
            value={data.bonuses || 0}
          />
          <Divider orientation="vertical" />
          <NumberInput
            label="Внешняя выплата"
            labelPlacement="outside"
            classNames={{stepperButton: 'hidden'}}
            isReadOnly={!canEdit}
            isWheelDisabled
            minValue={0}
            onValueChange={(value: number) => {
              updateCallback('external_payment', value)
            }}
            endContent={<Ruble iconStyle="Bold" />}
            className="min-w-[9rem] flex-1"
            value={data.external_payment || 0}
          />
          <Divider orientation="vertical" />
          <LocationSelect
            isReadOnly={!canEdit}
            className="min-w-[9rem] flex-1"
            callback={location => {
              updateCallback('location_id', location?.id || null)
            }}
            dynamicLocationId
            locationId={data.location_id}
            locations={locations}
          />
          <Divider orientation="vertical" />
          <NumberInput
            readOnly
            variant="bordered"
            label="Сумма"
            labelPlacement="outside"
            classNames={{stepperButton: 'hidden'}}
            endContent={<Ruble iconStyle="Bold" />}
            className="min-w-[9rem] flex-1"
            value={
              data.value + (data.bonuses || 0) - (data.external_payment || 0)
            }
          />
          <Divider orientation="vertical" />
          <NumberInput
            readOnly
            variant="bordered"
            label="Остаток"
            labelPlacement="outside"
            classNames={{stepperButton: 'hidden'}}
            endContent={<Ruble iconStyle="Bold" />}
            className="min-w-[9rem] flex-1"
            value={
              data.value +
              (data.bonuses || 0) -
              (data.taken || 0) -
              (data.external_payment || 0)
            }
          />
        </div>
        <div className="flex w-full items-center gap-2">
          {canIssue && (
            <>
              <Button
                isLoading={loading}
                className="min-w-[9rem]"
                onPress={issuePayroll}
                color={
                  data.issue_confirmed
                    ? 'primary'
                    : data.taken
                      ? 'success'
                      : 'default'
                }
                isDisabled={
                  !(
                    data.issue_confirmed &&
                    data.location_id === worker.locationId
                  )
                }>
                {data.taken ? 'Выдано' : 'Выдать'}
              </Button>
              <Divider orientation="vertical" />
              {data.taken ? (
                <>
                  <div className="min-w-[9rem]">
                    <p>Выдано:</p>
                    <Code className="w-full" color="success">
                      {data.taken}
                    </Code>
                  </div>
                  <Divider orientation="vertical" />
                  <div>
                    <p>Забрал:</p>
                    <span className="border-white/20">{data.taken_by}, </span>
                    <span className="text-white/50">
                      {data.taken_at &&
                        DateTime.fromFormat(
                          data.taken_at,
                          'yyyy-MM-dd HH:mm:ss',
                        ).toFormat('dd.MM.yyyy HH:mm:ss')}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-[9rem]">
                    <p>К выдаче:</p>
                    {data.to_take ? (
                      <Code className="w-full" color="primary">
                        {data.to_take}
                      </Code>
                    ) : (
                      <i>Не указано</i>
                    )}
                  </div>
                  <Divider orientation="vertical" />
                  <div>
                    <p>Заберёт:</p>
                    {data.to_take_by ? (
                      <p>{data.to_take_by}</p>
                    ) : (
                      <i>Не указано</i>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </fieldset>
    </>
  )
}
