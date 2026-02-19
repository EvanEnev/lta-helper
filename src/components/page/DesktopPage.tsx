import UpcomingShifts from './UpcomingShifts'
import RankIcon from '@/src/components/global/RankIcon'
import UpcomingSalary from '@/src/components/page/UpcomingSalary'
import {ShortSalary} from '@/app/page'
import {Progress, Skeleton} from '@heroui/react'
import {
  Day,
  LTWorker,
  RankDescription,
  RankRequirement,
} from '@/src/utils/types'
import {Button, Checkbox, Disclosure, Separator} from '@heroui/react-beta'
import {useMemo} from 'react'
import groupBy from '@/lib/functions/groupBy'

interface DesktopPageProps {
  worker: LTWorker
  workingDays: Day[]
  salaryData: ShortSalary
  ranksData: RankDescription[]
}

export default function DesktopPage({
  salaryData,
  worker,
  workingDays,
  ranksData,
}: DesktopPageProps) {
  const currentRankData = ranksData.find(d => d.rank.name === worker.rank)?.data

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          currentRankData?.filter(d => !!d.category).map(d => d.category),
        ),
      ),
    [currentRankData],
  )

  const groupedCategories = useMemo(() => {
    if (categories.length === 0) return {}
    if (!currentRankData) return {}

    return groupBy(
      currentRankData.filter(d => !!d.category),
      'category',
    )
  }, [categories.length, currentRankData])

  const done = useMemo(() => {
    const withoutCategories = currentRankData
      ?.filter(d => !d.category && !d.meta?.isChoice)
      .every(d => (d.type === 'check' ? d.done : d.value! >= d.limit!))

    const choices = currentRankData?.filter(d => d.meta?.isChoice)

    return (
      withoutCategories &&
      (Object.values(groupedCategories).length
        ? // @ts-ignore
          Object.values(groupedCategories).some((c: RankRequirement[]) =>
            c.every(d => (d.type === 'check' ? d.done : d.value! >= d.limit!)),
          )
        : true) &&
      choices?.some(d => (d.type === 'check' ? d.done : d.value! >= d.limit!))
    )
  }, [currentRankData, groupedCategories])

  return (
    <main className="h-full w-full">
      <div className="flex justify-between gap-4 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex h-fit items-center gap-4 text-3xl">
            <RankIcon
              style={{filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))'}}
              rank={worker?.rank || ''}
              className="w-56"
            />{' '}
            {worker?.rank || ''}
            <Progress
              aria-label="Прогресс"
              showValueLabel
              label="Прогресс ранга"
              color={done ? 'success' : 'primary'}
              value={
                ranksData.length
                  ? currentRankData?.reduce(
                      (acc, cur) => (cur.done ? acc + 1 : acc),
                      0,
                    )
                  : 0
              }
              maxValue={currentRankData?.length || undefined}
            />
          </div>
          <div className="flex flex-wrap gap-2 overflow-auto">
            {ranksData.map(rank => (
              <div
                key={rank.rank.id}
                className="border-content1-foreground/20 flex flex-col items-center gap-2 rounded-2xl border-2 p-2">
                <RankIcon rank={rank?.rank.name || ''} className="w-40" />{' '}
                <p>{rank?.rank.name || ''}</p>
                <Separator />
                {rank.data.length ? (
                  <Disclosure
                    defaultExpanded={rank.rank.name === worker.rank}
                    className="flex flex-col items-center gap-2">
                    <Disclosure.Heading>
                      <Button slot="trigger" variant="secondary">
                        Информация о ранге <Disclosure.Indicator />
                      </Button>
                    </Disclosure.Heading>
                    <Disclosure.Content>
                      {rank.data.map(req => (
                        <div
                          key={req.id}
                          className="flex items-center justify-center gap-2">
                          <Checkbox
                            isReadOnly
                            isSelected={req.done}
                            variant="secondary">
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox>
                          <p>{req.name}</p>
                          {req.type === 'number' && (
                            <p>
                              {req.value || 0}/{req.limit}
                            </p>
                          )}
                        </div>
                      ))}
                    </Disclosure.Content>
                  </Disclosure>
                ) : (
                  <i>Нет информации..</i>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-[50%] max-w-full flex-col items-center gap-4">
          <UpcomingShifts workingDays={workingDays} />
          <UpcomingSalary data={salaryData} worker={worker} />
        </div>
      </div>
    </main>
  )
}
