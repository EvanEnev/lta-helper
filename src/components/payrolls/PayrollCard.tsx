import {LTPayroll, LTWorker} from '@/src/utils/types'
import {DateTime, Interval} from 'luxon'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Code,
  semanticColors,
} from '@heroui/react'
import Link from 'next/link'
import {useTheme} from 'next-themes'
import checkPermissions from '@/lib/functions/checkPermissions'
import DeleteButton from '@/src/components/global/DeleteButton'
import {useCallback, useMemo} from 'react'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {Icon} from '@iconify/react'

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
  const {theme} = useTheme()
  const interval = Interval.fromISO(data.dates)
  const createdAt = DateTime.fromISO(data.createdAt)
  const takeBy = DateTime.fromISO(data.takeBy)
  const today = useMemo(
    () => DateTime.now().set({hour: 0, minute: 0, second: 0}),
    [],
  )

  // @ts-ignore
  const themeColors = semanticColors[theme || 'dark']

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
      className={`h-[18rem] w-full sm:w-[20rem] ${takeBy < today ? 'opacity-90' : 'border-1'}`}>
      <CardHeader>{interval.toFormat('dd.MM.yyyy')}</CardHeader>
      <CardBody className="flex flex-col gap-2">
        {canViewAllData && (
          <>
            <p>
              Создана: {createdAt.toFormat('dd.MM.yyyy HH:mm')},{' '}
              {data.createdBy.name}
            </p>
            <p>Кол-во сотрудников: {data.workersCount}</p>
          </>
        )}
        <div>
          <span>Можно забрать до: </span>
          <Code color={takeBy >= today ? 'success' : 'danger'}>
            {takeBy.toFormat('dd.MM.yyyy')}
          </Code>
        </div>
        <div className="flex items-center gap-2">
          <p>Бонусы: </p>
          {data.bonuses ? (
            <Icon
              color={themeColors.success['500']}
              icon="solar:check-circle-bold"
              width="20"
              height="20"
            />
          ) : (
            <Icon
              icon="solar:close-circle-bold"
              width="20"
              height="20"
              color={themeColors.danger['500']}
            />
          )}
        </div>
      </CardBody>
      <CardFooter className="flex gap-2">
        <Button
          variant="faded"
          className={
            checkPermissions(['edit_payrolls'], worker)
              ? 'flex-1 sm:flex-none'
              : 'flex-1'
          }
          as={Link}
          href={`/payrolls/${data.id}`}
          startContent={
            <Icon icon="solar:chat-line-bold" width="24" height="24" />
          }>
          Подробнее
        </Button>
        {checkPermissions(['edit_payrolls'], worker) && (
          <DeleteButton
            className="flex-1"
            callback={deletePayroll}
            showConfirmLabel={false}
            label={'Удалить'}
          />
        )}
      </CardFooter>
    </Card>
  )
}
