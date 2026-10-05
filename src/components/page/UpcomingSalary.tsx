import Link from 'next/link'
import {ArrowUpRight, Info, Wallet} from 'lucide-react'
import {ShortSalary} from '@/app/page'
import SalaryCard from '@/src/components/page/SalaryCard'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip'

interface UpcomingSalaryProps {
  data: ShortSalary
}

const rub = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

export default function UpcomingSalary({data}: UpcomingSalaryProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <SalaryCard
          sum={data.previousSum}
          fines={data.previousFines}
          bonuses={data.previousBonuses}
          value={data.previousSalary}
          dates={data.previousDates}
          takeDate={data.previousSalaryTakeDate}
          title="Текущая выплата"
          external={data.previousExternal}
          isCurrent
        />
        <SalaryCard
          sum={data.currentSum}
          fines={data.currentFines}
          bonuses={data.currentBonuses}
          value={data.currentSalary}
          dates={data.currentDates}
          takeDate={data.currentSalaryTakeDate}
          external={data.currentExternal}
          title="Будущая выплата"
        />
      </div>
      <Card size="sm">
        <CardContent className="flex items-center justify-between gap-2">
          <div className="text-muted-foreground flex items-center gap-2">
            <Wallet className="size-4" />
            Остаток
            <Tooltip>
              <TooltipTrigger
                aria-label="Пояснение"
                className="text-muted-foreground">
                <Info className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>
                Остаток формируется после закрытия предыдущей ведомости. Если он
                некорректный — нужно подождать некоторое время
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="font-medium tabular-nums">
            {rub.format(data.balance)}
          </span>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1"
          variant="secondary"
          size="lg"
          nativeButton={false}
          render={<Link href="/payrolls/issue" />}>
          Получение ЗП
          <ArrowUpRight />
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          size="lg"
          nativeButton={false}
          render={<Link href="/payrolls" />}>
          Ведомости
          <ArrowUpRight />
        </Button>
      </div>
    </div>
  )
}
