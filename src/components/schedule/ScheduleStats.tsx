import {CircleCheck, CircleDashed, CircleHelp, CircleMinus} from 'lucide-react'
import type {ComponentType} from 'react'
import {Card, CardContent} from '@/components/ui/card'
import {cn} from '@/lib/utils'

interface ScheduleStatsProps {
  can: number
  limited: number
  cannot: number
  empty: number
}

interface StatProps {
  icon: ComponentType<{className?: string}>
  value: number
  label: string
  short: string
  className?: string
}

// На телефоне все четыре плитки в одну строку: число, иконка и короткая подпись
function Stat({icon: StatIcon, value, label, short, className}: StatProps) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col items-start gap-1.5 px-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-(--card-spacing)">
        <StatIcon className={cn('size-5 shrink-0 sm:size-6', className)} />
        <div className="min-w-0">
          <p className="text-xl leading-none font-semibold tabular-nums sm:text-2xl">
            {value}
          </p>
          <p className="text-muted-foreground mt-1 truncate text-[11px] sm:text-xs">
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ScheduleStats({
  can,
  limited,
  cannot,
  empty,
}: ScheduleStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      <Stat
        icon={CircleCheck}
        value={can}
        label="Могу"
        short="Могу"
        className="text-success"
      />
      <Stat
        icon={CircleHelp}
        value={limited}
        label="С ограничением"
        short="Огран."
        className="text-warning"
      />
      <Stat
        icon={CircleMinus}
        value={cannot}
        label="Не могу"
        short="Не могу"
        className="text-destructive"
      />
      <Stat
        icon={CircleDashed}
        value={empty}
        label="Не заполнено"
        short="Пусто"
        className="text-muted-foreground"
      />
    </div>
  )
}
