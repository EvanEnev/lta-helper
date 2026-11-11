import type {ComponentType} from 'react'
import {Card, CardContent} from '@/components/ui/card'
import {cn} from '@/lib/utils'

interface StatTileProps {
  icon: ComponentType<{className?: string}>
  value: number | string
  label: string
  className?: string
}

export default function StatTile({
  icon: StatIcon,
  value,
  label,
  className,
}: StatTileProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <StatIcon className={cn('size-6 shrink-0', className)} />
        <div className="min-w-0">
          <p className="text-2xl leading-none font-semibold tabular-nums">
            {value}
          </p>
          <p className="text-muted-foreground mt-1 truncate text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
