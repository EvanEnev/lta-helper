import {ShortSalary} from '@/app/page'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  LinkIcon,
} from '@heroui/react'
import Link from 'next/link'
import {Ruble} from 'solar-icon-set'

function BonusesAndFines({bonuses, fines, salary}: {bonuses: number, fines: number, salary: number}) {
  return <>
    <p className="text-foreground-500">Бонусы: {bonuses}</p>
    <p className="text-foreground-500">Штрафы: {fines}</p>
    <p className="text-foreground-500">ЗП: {salary - (bonuses + fines)}</p>
  </>
}

export default function UpcomingSalary({data}: {data: ShortSalary}) {
  const isCurrentWithBonuses = data.currentSalaryTakeDate.startsWith('20')

  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="ripple bg-success/90 absolute h-3 w-3 rounded-full" />
            <span className="ripple bg-success/90 absolute h-3 w-3 rounded-full delay-1" />
            <span className="ripple bg-success/90 absolute h-3 w-3 rounded-full delay-2" />
            <span className="bg-success z-10 block h-3 w-3 rounded-full" />
            <p>Текущая выплата ({data.previousDates})</p>
          </div>
          <p className="text-foreground-500">
            Можно получить с {data.previousSalaryTakeDate}
          </p>
          <div className="flex items-center gap-1">
            {data.previousSalary} <Ruble iconStyle="Bold" />
          </div>
          {!isCurrentWithBonuses && <BonusesAndFines bonuses={data.bonuses} fines={data.fines} salary={data.previousSalary} />}
        </div>
        <Divider />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="bg-primary block h-3 w-3 rounded-full" />
            <p>Будущая выплата ({data.currentDates})</p>
          </div>
          <p className="text-foreground-500">
            Можно получить с {data.currentSalaryTakeDate}
          </p>
          <div className="flex items-center gap-1">
            {data.currentSalary} <Ruble iconStyle="Bold" />
          </div>
          {isCurrentWithBonuses && <BonusesAndFines bonuses={data.bonuses} fines={data.fines} salary={data.currentSalary} />}
        </div>
      </CardBody>
      <CardFooter>
        <Button as={Link} startContent={<LinkIcon />} href="/salary">
          Подробнее
        </Button>
      </CardFooter>
    </Card>
  )
}
