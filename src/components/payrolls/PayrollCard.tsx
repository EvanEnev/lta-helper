import {LTPayroll} from '@/src/utils/types'
import {DateTime, Interval} from 'luxon'
import {Button, Card, CardBody, CardFooter, CardHeader} from '@heroui/react'
import Link from 'next/link'
import {Pen2} from 'solar-icon-set'

interface PayrollCardProps {
  data: LTPayroll
}

export default function PayrollCard({data}: PayrollCardProps) {
  const interval = Interval.fromISO(data.dates)
  const createdAt = DateTime.fromISO(data.createdAt)
  const takeBy = DateTime.fromISO(data.takeBy)

  return (
    <Card className="h-[15rem] w-[15rem]">
      <CardHeader>{interval.toFormat('dd.MM.yyyy')}</CardHeader>
      <CardBody>
        <p>
          Создана: {createdAt.toFormat('dd.MM.yyyy HH:mm')},{' '}
          {data.createdBy.name}
        </p>
        <p>Кол-во сотрудников: {data.workersCount}</p>
        <p>Можно забрать до: {takeBy.toFormat('dd.MM.yyyy')}</p>
        <p>Бонусы: {data.bonuses ? 'Да' : 'Нет'}</p>
      </CardBody>
      <CardFooter>
        <Button
          variant="faded"
          className="w-full"
          as={Link}
          href={`/payrolls/${data.id}`}
          startContent={<Pen2 />}>
          Изменить
        </Button>
      </CardFooter>
    </Card>
  )
}
