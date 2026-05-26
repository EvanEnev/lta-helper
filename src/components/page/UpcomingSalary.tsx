import {ShortSalary} from '@/app/page'
import SalaryCard from '@/src/components/page/SalaryCard'
import {Button, Description, Link} from '@heroui/react'
import {Icon} from '@iconify/react'

interface UpcomingSalaryProps {
  data: ShortSalary
}

export default function UpcomingSalary({data}: UpcomingSalaryProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-col gap-4 sm:flex-row">
        <SalaryCard
          sum={data.previousSum}
          balance={data.balance}
          fines={data.previousFines}
          bonuses={data.previousBonuses}
          value={data.previousSalary}
          dates={data.previousDates}
          title={`Текущая выплата (${data.previousSalaryTakeDate})`}
          external={data.previousExternal}
          isCurrent
        />
        <SalaryCard
          sum={data.currentSum}
          balance={data.balance}
          fines={data.currentFines}
          bonuses={data.currentBonuses}
          value={data.currentSalary}
          dates={data.currentDates}
          external={data.currentExternal}
          title={`Будущая выплата (${data.currentSalaryTakeDate})`}
        />
      </div>
      <Description>
        Остаток формируется после закрытия предыдущей ведомости и дублируется в
        обеих карточках. Если он некорректный - нужно подождать некоторое время
      </Description>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link className="w-full flex-1 no-underline" href="/payrolls/issue">
          <Button className="flex-1" variant="tertiary">
            Получение ЗП
            <Icon icon="solar:arrow-right-up-outline" width="24" height="24" />
          </Button>
        </Link>
        <Link className="w-full flex-1 no-underline" href="/payrolls">
          <Button className="flex-1" variant="tertiary">
            Ведомости
            <Icon icon="solar:arrow-right-up-outline" width="24" height="24" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
