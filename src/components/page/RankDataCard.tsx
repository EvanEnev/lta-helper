import RankIcon from '@/src/components/global/RankIcon'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {Checkbox} from '@/components/ui/checkbox'
import {
  getRankProgress,
  groupRequirements,
  isRequirementDone,
} from '@/lib/functions/rankProgress'
import {cn} from '@/lib/utils'
import type {RankDescription, RankRequirement} from '@/src/utils/types'

interface RankDataCardProps {
  workerRank: string
  rank: RankDescription
  className?: string
}

function Requirement({req}: {req: RankRequirement}) {
  const done = isRequirementDone(req)

  return (
    <li className="flex items-center gap-2 py-1.5">
      {req.type === 'check' && (
        <Checkbox checked={done} readOnly aria-label={req.name} />
      )}
      <span className={cn('flex-1', done && 'text-muted-foreground')}>
        {req.name}
      </span>
      {req.meta?.isChoice && <Badge variant="outline">на выбор</Badge>}
      {req.type !== 'check' && (
        <span
          className={cn(
            'tabular-nums',
            done ? 'text-success' : 'text-muted-foreground',
          )}>
          {req.value ?? 0} / {req.limit}
        </span>
      )}
    </li>
  )
}

export default function RankDataCard({
  workerRank,
  rank,
  className,
}: RankDataCardProps) {
  const isCurrent = rank.rank.name === workerRank
  const {plain, categories} = groupRequirements(rank.data)
  const categoryNames = Object.keys(categories)
  const {done, completed, total} = getRankProgress(rank.data)

  return (
    <Card className={cn(isCurrent && 'ring-primary/40', className)}>
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
        <RankIcon rank={rank.rank.name} className="row-span-2 h-auto w-14" />
        <CardTitle className="flex items-center gap-2 text-base">
          {rank.rank.name}
          {isCurrent && <Badge>Текущий</Badge>}
        </CardTitle>
        {total > 0 && (
          <p
            className={cn(
              'text-sm tabular-nums',
              done ? 'text-success' : 'text-muted-foreground',
            )}>
            Выполнено {completed} / {total}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <Accordion defaultValue={isCurrent ? ['requirements'] : []}>
            <AccordionItem value="requirements">
              <AccordionTrigger>Информация о ранге</AccordionTrigger>
              <AccordionContent>
                {plain.length > 0 && (
                  <ul className="flex flex-col divide-y">
                    {plain.map(req => (
                      <Requirement key={req.id} req={req} />
                    ))}
                  </ul>
                )}
                {categoryNames.length > 1 && (
                  <p className="text-muted-foreground mt-3 text-xs">
                    Достаточно выполнить одну из категорий
                  </p>
                )}
                {categoryNames.map(name => (
                  <div key={name} className="bg-muted/50 mt-3 rounded-lg p-3">
                    <p className="mb-1 font-medium">{name}</p>
                    <ul className="flex flex-col divide-y">
                      {categories[name].map(req => (
                        <Requirement key={req.id} req={req} />
                      ))}
                    </ul>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-sm">Нет информации..</p>
        )}
      </CardContent>
    </Card>
  )
}
