import {Icon} from '@iconify/react'
import AnimatedInnerShadow from '@/src/components/global/AnimatedInnerShadow'
import useColors from '@/src/hooks/useColors'

interface SalaryCardProps {
  sum: number
  balance: number
  fines: number
  bonuses: number
  value: number
  dates: string
  title: string
  isCurrent?: boolean
}

export default function SalaryCard({
  sum,
  balance,
  fines,
  title,
  dates,
  bonuses,
  value,
  isCurrent,
}: SalaryCardProps) {
  const colors = useColors()
  return (
    <div
      className={`bg-surface relative flex flex-1 flex-col gap-2 rounded-2xl border-2 p-4 ${isCurrent ? 'border-success' : 'border-accent'}`}>
      {isCurrent && (
        <AnimatedInnerShadow
          className="rounded-2xl"
          color={colors?.success || ''}
        />
      )}
      <p className="text-xl font-bold">{title}</p>
      <div className="flex items-center gap-2">
        <Icon icon="solar:calendar-outline" width="18" height="18" />
        <p className="text-foreground-500">За период {dates}</p>
      </div>
      <div className="bg-default flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:ruble-outline" width="20" height="20" />
        <p>Сумма: {sum}</p>
      </div>
      <div className="bg-default flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:banknote-2-outline" width="20" height="20" />
        <p>ЗП: {value}</p>
      </div>
      <div className="bg-default flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:bill-check-outline" width="20" height="20" />
        <p>Бонусы: {bonuses}</p>
      </div>
      <div className="bg-default flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:bill-cross-outline" width="20" height="20" />
        <p>Штрафы: {fines}</p>
      </div>
      <div className="bg-default flex items-center gap-2 rounded-xl p-2">
        <Icon icon="solar:wallet-money-outline" width="20" height="20" />
        <p>Остаток: {balance}</p>
      </div>
    </div>
  )
}
