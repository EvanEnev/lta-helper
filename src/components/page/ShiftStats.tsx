import {CalendarCheck, CalendarClock, Timer} from 'lucide-react'
import type {ComponentType} from 'react'
import {Card, CardContent} from '@/components/ui/card'

interface ShiftStatsProps {
  worked: number
  left: number
  nextIn?: number
}

interface StatProps {
  icon: ComponentType<{className?: string}>
  value: string | number
  label: string
}

function Stat({icon: StatIcon, value, label}: StatProps) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <StatIcon className="text-muted-foreground size-4" />
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-muted-foreground text-xs">{label}</p>
      </CardContent>
    </Card>
  )
}

const nextLabel = (days?: number) => {
  if (days === undefined) return '—'
  if (days === 0) return 'Сегодня'
  if (days === 1) return 'Завтра'
  return `${days} дн.`
}

export default function ShiftStats({worked, left, nextIn}: ShiftStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat icon={CalendarCheck} value={worked} label="Отработано в месяце" />
      <Stat icon={CalendarClock} value={left} label="Смен впереди" />
      <Stat icon={Timer} value={nextLabel(nextIn)} label="До смены" />
    </div>
  )
}
