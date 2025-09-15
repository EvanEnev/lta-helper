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

interface PayrollCardProps {
  data: LTPayroll
}

export default function PayrollCard({data}: PayrollCardProps) {
  const {worker} = useAuth()
  const {theme} = useTheme()
  const interval = Interval.fromISO(data.dates)
  const createdAt = DateTime.fromISO(data.createdAt)
  const takeBy = DateTime.fromISO(data.takeBy)
  // @ts-ignore
  const themeColors = semanticColors[theme || 'dark']

  const canViewAllData = checkPermissions(
    ['view_all_payrolls', 'edit_payrolls'],
    worker,
  )

  return (
    <Card className="h-[18rem] w-[20rem]">
      <CardHeader>{interval.toFormat('dd.MM.yyyy')}</CardHeader>
      <CardBody className="flex flex-col gap-2">
        {canViewAllData && (
          <>
            `
            <p>
              Создана: {createdAt.toFormat('dd.MM.yyyy HH:mm')},{' '}
              {data.createdBy.name}
            </p>
            <p>Кол-во сотрудников: {data.workersCount}</p>
          </>
        )}
        <div>
          <span>Можно забрать до: </span>
          <Code color="success">{takeBy.toFormat('dd.MM.yyyy')}</Code>
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
      <CardFooter>
        <Button
          variant="faded"
          className="w-full"
          as={Link}
          href={`/payrolls/${data.id}`}
          startContent={<ChatLine iconStyle="Bold" />}>
          Подробнее
        </Button>
      </CardFooter>
    </Card>
  )
}
