import {LTPayroll} from '@/src/utils/types'
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
import {ChatLine, CheckCircle, CloseCircle} from 'solar-icon-set'
import {useTheme} from 'next-themes'
import checkPermissions from '@/lib/functions/checkPermissions'
import {useAuth} from '@/src/components/global/providers/authProvider'
import DeleteButton from '@/src/components/global/DeleteButton'
import {useCallback, useMemo} from 'react'
import fetchHandler from '@/src/utils/global/fetchHandler'

interface PayrollCardProps {
  data: LTPayroll
  onDelete: (payrollId: LTPayroll['id']) => void
}

export default function PayrollCard({data, onDelete}: PayrollCardProps) {
  const {worker} = useAuth()
  const {theme} = useTheme()
  const interval = Interval.fromISO(data.dates)
  const createdAt = DateTime.fromISO(data.createdAt)
  const takeBy = DateTime.fromISO(data.takeBy)
  const today = useMemo(() => DateTime.now(), [])

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
    <Card className="h-[18rem] w-[20rem]">
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
          <Code color={takeBy > today ? 'success' : 'danger'}>
            {takeBy.toFormat('dd.MM.yyyy')}
          </Code>
        </div>
        <div className="flex items-center gap-2">
          <p>Бонусы: </p>
          {data.bonuses ? (
            <CheckCircle
              iconStyle="Bold"
              color={themeColors.success['500']}
              size={20}
            />
          ) : (
            <CloseCircle
              iconStyle="Bold"
              size={20}
              color={themeColors.danger['500']}
            />
          )}
        </div>
      </CardBody>
      <CardFooter className="flex gap-2">
        <Button
          variant="faded"
          className={
            checkPermissions(['edit_payrolls'], worker) ? '' : 'flex-1'
          }
          as={Link}
          href={`/payrolls/${data.id}`}
          startContent={<ChatLine iconStyle="Bold" />}>
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
