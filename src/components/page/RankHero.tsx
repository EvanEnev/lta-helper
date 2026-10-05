import RankIcon from '@/src/components/global/RankIcon'
import {Card, CardContent} from '@/components/ui/card'
import {Progress, ProgressLabel} from '@/components/ui/progress'
import {getRankProgress} from '@/lib/functions/rankProgress'
import {cn} from '@/lib/utils'
import type {RankRequirement} from '@/src/utils/types'

interface RankHeroProps {
  rank: string
  data: RankRequirement[]
}

export default function RankHero({rank, data}: RankHeroProps) {
  const {done, completed, total} = getRankProgress(data)

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <RankIcon
          rank={rank}
          className="h-auto w-20 shrink-0 sm:w-28"
          style={{filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.4))'}}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <p className="text-muted-foreground text-sm">Ваш ранг</p>
            <p className="truncate text-2xl font-semibold sm:text-3xl">
              {rank}
            </p>
          </div>
          {total > 0 && (
            <Progress
              value={completed}
              max={total}
              className={cn(
                done && '**:data-[slot=progress-indicator]:bg-success',
              )}>
              <ProgressLabel>Прогресс ранга</ProgressLabel>
              <span className="text-muted-foreground ml-auto text-sm tabular-nums">
                {completed} / {total}
              </span>
            </Progress>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
