import {LTPayroll, LTWorker} from '@/src/utils/types'
import {DateTime, Interval} from 'luxon'
import {Card, Button} from '@heroui/react'
import Link from 'next/link'
import checkPermissions from '@/lib/functions/checkPermissions'
import DeleteButton from '@/src/components/global/DeleteButton'
import {useCallback, useMemo} from 'react'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {Icon} from '@iconify/react'
import useColors from '@/src/hooks/useColors'

interface PayrollCardProps {
  data: LTPayroll
  onDelete: (payrollId: LTPayroll['id']) => void
  worker: LTWorker
}

export default function PayrollCard({
  data,
  onDelete,
  worker,
}: PayrollCardProps) {
  const colors = useColors()
  const interval = Interval.fromISO(data.dates)
  const createdAt = DateTime.fromISO(data.createdAt)
  const takeBy = DateTime.fromISO(data.takeBy)
  const today = useMemo(
    () => DateTime.now().set({hour: 0, minute: 0, second: 0}),
    [],
  )

  const canViewAllData = checkPermissions(
    ['view_all_payrolls', 'edit_payrolls'],
    worker,
  )

  const deletePayroll = useCallback(async () => {
    const body = {payroll_id: data.id}

    await fetchHandler({url: '/api/payrolls/delete', method: 'POST', body})
    onDelete(data.id)
  }, [data.id, onDelete])

  return (
    <Card
      className={`h-72 w-full sm:w-[20rem] ${takeBy < today ? 'opacity-90' : 'border-1'}`}>
      <Card.Header>{interval.toFormat('dd.MM.yyyy')}</Card.Header>
      <Card.Content className="flex flex-col gap-2">
        {canViewAllData && (
          <>
            {!data.isPublished && (
              <p className="text-danger mx-auto underline">Не опубликована</p>
            )}
            <p>
              Создана: {createdAt.toFormat('dd.MM.yyyy HH:mm')},{' '}
              {data.createdBy.name}
            </p>
            <p>Кол-во сотрудников: {data.workersCount}</p>
          </>
        )}
        <div>
          <span>Можно забрать до: </span>
          <p className={`${takeBy >= today ? 'text-success' : 'text-danger'}`}>
            {takeBy.toFormat('dd.MM.yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p>Бонусы: </p>
          {data.bonuses ? (
            <Icon
              color={colors?.success}
              icon="solar:check-circle-bold"
              width="20"
              height="20"
            />
          ) : (
            <Icon
              icon="solar:close-circle-bold"
              width="20"
              height="20"
              color={colors?.danger}
            />
          )}
        </div>
      </Card.Content>
      <Card.Footer className="flex gap-2">
        <Button
          onPress={() => {
            if (!data.isPublished) {
              localStorage.setItem('payrollsCreate', JSON.stringify(data.meta))
            }
          }}
          variant="tertiary"
          className={
            checkPermissions(['edit_payrolls'], worker)
              ? 'flex-1 sm:flex-none'
              : 'flex-1'
          }>
          <Link
            className="flex items-center gap-2"
            href={{
              pathname: data.isPublished
                ? `/payrolls/${data.id}`
                : `/payrolls/create`,
              query: data.isPublished
                ? undefined
                : {
                    dates: JSON.stringify({
                      start: data.meta.dates?.start.toString(),
                      end: data.meta.dates?.end.toString(),
                    }),
                    moneyOnLocations: JSON.stringify([]),
                    bonuses: data.meta.withBonuses,
                    workersBonusesRange: JSON.stringify({
                      start: data.meta.dates?.start.toString(),
                      end: data.meta.dates?.end.toString(),
                    }),
                    actorsBonusesRange: JSON.stringify({
                      start: data.meta.dates?.start.toString(),
                      end: data.meta.dates?.end.toString(),
                    }),
                  },
            }}>
            <Icon icon="solar:chat-line-bold" width="24" height="24" />
            Подробнее
          </Link>
        </Button>
        {checkPermissions(['edit_payrolls'], worker) && (
          <DeleteButton
            className="flex-1"
            callback={deletePayroll}
            showConfirmLabel={false}
            label={'Удалить'}
          />
        )}
      </Card.Footer>
    </Card>
  )
}
