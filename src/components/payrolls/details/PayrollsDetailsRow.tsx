import {
  LTLocation,
  LTPayroll,
  LTWorker,
  LTWorkerPayrollData,
} from '@/src/utils/types'
import RankIcon from '@/src/components/global/RankIcon'
import {Button, Separator, NumberField, Label} from '@heroui/react'
import {DateTime} from 'luxon'
import LocationSelect from '@/src/components/global/LocationSelect'
import {memo, RefObject, useCallback, useState} from 'react'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {Socket} from 'socket.io-client'
import {DefaultEventsMap} from 'socket.io'
import {authClient} from '@/lib/auth/authClient'
import separateNumber from '@/lib/functions/separateNumber'
import useIsMobile from '@/src/hooks/useIsMobile'
import {useAtomValue} from 'jotai'
import {headerSizesAtom} from '@/src/utils/global/atoms'
import {Icon} from '@iconify/react'

interface PayrollsDetailsRowProps {
  data: LTWorkerPayrollData
  canIssue: boolean
  locations: LTLocation[]
  canEdit: boolean
  socketRef: RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>
  payrollId: LTPayroll['id']
  worker: LTWorker
}

function PayrollsDetailsRow({
  data,
  canIssue,
  locations,
  canEdit,
  payrollId,
  socketRef,
  worker,
}: PayrollsDetailsRowProps) {
  const headerSizes = useAtomValue(headerSizesAtom)
  const isMobile = useIsMobile()
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
      <fieldset className="glass relative flex flex-col items-stretch gap-2 rounded-2xl p-2">
        <legend
          className="sticky left-2 flex translate-y-1 items-center justify-start gap-2"
          style={{
            left: isMobile ? '0.5rem' : headerSizes.width || 0,
          }}>
          <RankIcon rank={data.worker.rank} />
          <p className="mx-auto">{data.worker.name}</p>
        </legend>
        <div className="flex items-center gap-2">
          <NumberField
            variant="secondary"
            isReadOnly={!canEdit}
            className="min-w-36 flex-1"
            value={data.value || 0}
            isWheelDisabled
            onChange={value => {
              updateCallback('value', value)
            }}>
            <Label>ЗП</Label>
            <NumberField.Group className="flex px-2">
              <NumberField.Input className="flex-1" />
              <Icon icon="solar:ruble-bold" width="24" height="24" />
            </NumberField.Group>
          </NumberField>
          <Separator orientation="vertical" />
          <NumberField
            variant="secondary"
            isReadOnly={!canEdit}
            className="min-w-36 flex-1"
            value={data.bonuses || 0}
            isWheelDisabled
            onChange={value => {
              updateCallback('bonuses', value)
            }}>
            <Label>Бонусы</Label>
            <NumberField.Group className="flex px-2">
              <NumberField.Input className="flex-1" />
              <Icon icon="solar:ruble-bold" width="24" height="24" />
            </NumberField.Group>
          </NumberField>
          <Separator orientation="vertical" />
          <NumberField
            variant="secondary"
            isReadOnly={!canEdit}
            className="min-w-36 flex-1"
            value={data.external_payment || 0}
            isWheelDisabled
            onChange={value => {
              updateCallback('external_payment', value)
            }}>
            <Label>Внешняя выплата</Label>
            <NumberField.Group className="flex px-2">
              <NumberField.Input className="flex-1" />
              <Icon icon="solar:ruble-bold" width="24" height="24" />
            </NumberField.Group>
          </NumberField>
          <Separator orientation="vertical" />
          <LocationSelect
            isReadOnly={!canEdit}
            className="min-w-36 flex-1"
            callback={location => {
              updateCallback(
                'location_id',
                (location as LTLocation)?.id || null,
              )
            }}
            dynamicLocationId
            locationId={data.location_id}
            locations={locations}
          />
          <Separator orientation="vertical" />
          <NumberField
            variant="secondary"
            isReadOnly
            className="min-w-36 flex-1"
            value={
              data.value + (data.bonuses || 0) - (data.external_payment || 0)
            }
            isWheelDisabled>
            <Label>Сумма</Label>
            <NumberField.Group className="flex px-2">
              <NumberField.Input className="flex-1" />
              <Icon icon="solar:ruble-bold" width="24" height="24" />
            </NumberField.Group>
          </NumberField>
          <Separator orientation="vertical" />
          <NumberField
            variant="secondary"
            isReadOnly
            className="min-w-36 flex-1"
            value={
              data.value +
              (data.bonuses || 0) -
              (data.taken || 0) -
              (data.external_payment || 0)
            }
            isWheelDisabled>
            <Label>Остаток</Label>
            <NumberField.Group className="flex px-2">
              <NumberField.Input className="flex-1" />
              <Icon icon="solar:ruble-bold" width="24" height="24" />
            </NumberField.Group>
          </NumberField>
        </div>
        <div className="flex w-full items-center gap-2">
          {canIssue && (
            <>
              <Button
                isPending={loading}
                className="h-full min-w-36"
                onPress={issuePayroll}
                variant={
                  data.issue_confirmed
                    ? 'primary'
                    : data.taken
                      ? 'tertiary'
                      : 'secondary'
                }
                isDisabled={
                  !(
                    data.issue_confirmed &&
                    data.location_id === worker.locationId
                  )
                }>
                {data.taken ? 'Выдано' : 'Выдать'}
              </Button>
              <Separator orientation="vertical" />
              {data.taken ? (
                <>
                  <div className="min-w-36">
                    <p>Выдано:</p>
                    <p className="text-success w-full">
                      {separateNumber(data.taken)}
                    </p>
                  </div>
                  <Separator orientation="vertical" />
                  <div>
                    <p>Забрал:</p>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-2">
                        <RankIcon
                          width={30}
                          height={30}
                          rank={data.taken_by.rank || ''}
                        />{' '}
                        <p>{data.taken_by.name},</p>
                      </div>
                      <p className="text-white/50">
                        {data.taken_at &&
                          DateTime.fromFormat(
                            data.taken_at,
                            'yyyy-MM-dd HH:mm:ss',
                          ).toFormat('dd.MM.yyyy HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-36">
                    <p>К выдаче:</p>
                    {data.to_take ? (
                      <p className="text-medium text-accent w-full">
                        {separateNumber(data.to_take)}
                      </p>
                    ) : (
                      <i>Не указано</i>
                    )}
                  </div>
                  <Separator orientation="vertical" />
                  <div>
                    <p>Заберёт:</p>
                    {
                      <div className="flex items-center gap-2">
                        <RankIcon
                          width={30}
                          height={30}
                          rank={data.to_take_by.rank || data.worker.rank || ''}
                        />
                        <p>{data.to_take_by.name || data.worker.name}</p>
                      </div>
                    }
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

export default memo(PayrollsDetailsRow)
