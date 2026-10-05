import {Badge} from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {Separator} from '@/components/ui/separator'
import {cn} from '@/lib/utils'

interface SalaryCardProps {
  sum: number
  fines: number
  bonuses: number
  value: number
  dates: string
  title: string
  takeDate: string
  external: number
  isCurrent?: boolean
}

const rub = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

interface RowProps {
  label: string
  value: number
  sign?: '+' | '−'
  className?: string
}

function Row({label, value, sign, className}: RowProps) {
  const isZero = value === 0
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-medium tabular-nums',
          isZero ? 'text-muted-foreground' : className,
        )}>
        {!isZero && sign}
        {rub.format(Math.abs(value))}
      </span>
    </div>
  )
}

export default function SalaryCard({
  sum,
  fines,
  title,
  dates,
  takeDate,
  bonuses,
  value,
  external,
  isCurrent,
}: SalaryCardProps) {
  return (
    <Card className={cn('min-w-0', isCurrent && 'ring-primary/40')}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          За период {dates} · выплата {takeDate}
        </CardDescription>
        <CardAction>
          <Badge variant={isCurrent ? 'default' : 'secondary'}>
            {isCurrent ? 'К выдаче' : 'В расчёте'}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <p className="text-3xl font-semibold tabular-nums">
            {rub.format(sum)}
          </p>
          <p className="text-muted-foreground text-sm">Итого к выплате</p>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <Row label="ЗП" value={value} />
          <Row
            label="Бонусы"
            value={bonuses}
            sign="+"
            className="text-success"
          />
          <Row
            label="Штрафы"
            value={fines}
            sign="−"
            className="text-destructive"
          />
          <Row label="Внешние выплаты" value={external} />
        </div>
      </CardContent>
    </Card>
  )
}
