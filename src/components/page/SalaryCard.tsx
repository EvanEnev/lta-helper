import {Icon} from '@iconify/react'
import AnimatedInnerShadow from '@/src/components/global/AnimatedInnerShadow'
import {semanticColors} from '@heroui/react'

interface SalaryCardProps {
  sum: number
  balance: number
  fines: number
  bonuses: number
  value: number
  dates: string
  title: string
  isCurrent?: boolean
  theme: string
}

export default function SalaryCard({
  sum,
  balance,
  fines,
  title,
  dates,
  bonuses,
  value,
  theme,
  isCurrent,
}: SalaryCardProps) {
  return (
    <div
      className={`bg-content1 relative flex flex-1 flex-col gap-2 rounded-2xl border-2 p-4 ${isCurrent ? 'border-success' : 'border-primary'}`}>
      {isCurrent && (
        <AnimatedInnerShadow
          className="rounded-2xl"
          // @ts-ignore
          color={semanticColors[theme].success['500']}
        />
      )}
      <p className="text-xl font-bold">{title}</p>
      <div className="flex items-center gap-2">
        <Icon icon="solar:calendar-outline" width="18" height="18" />
        <p className="text-foreground-500">За период {dates}</p>
      </div>
      <div className="bg-content2 flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:ruble-outline" width="20" height="20" />
        <p>Сумма: {sum}</p>
      </div>
      <div className="bg-content2 flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:banknote-2-outline" width="20" height="20" />
        <p>ЗП: {value}</p>
      </div>
      <div className="bg-content2 flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:bill-check-outline" width="20" height="20" />
        <p>Бонусы: {bonuses}</p>
      </div>
      <div className="bg-content2 flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:bill-cross-outline" width="20" height="20" />
        <p>Штрафы: {fines}</p>
      </div>
      <div className="bg-content2 flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:wallet-money-outline" width="20" height="20" />
        <p>Остаток: {balance}</p>
      </div>
    </div>
  )
}
