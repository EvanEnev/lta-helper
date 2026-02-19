import UpcomingShifts from './UpcomingShifts'
import RankIcon from '@/src/components/global/RankIcon'
import UpcomingSalary from '@/src/components/page/UpcomingSalary'
import {ShortSalary} from '@/app/page'
import {Progress} from '@heroui/react'
import {
  Day,
  LTWorker,
  RankDescription,
  RankRequirement,
} from '@/src/utils/types'
import {useMemo} from 'react'
import groupBy from '@/lib/functions/groupBy'
import RankDataCard from '@/src/components/page/RankDataCard'

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
          <div className="grid auto-rows-auto grid-cols-4 gap-2 overflow-auto">
            {ranksData.map(rank => (
              <RankDataCard
                key={rank.rank.id}
                workerRank={worker.rank}
                rank={rank}
              />
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
