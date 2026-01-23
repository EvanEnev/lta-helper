import UpcomingShifts from './UpcomingShifts'
import RankIcon from '@/src/components/global/RankIcon'
import UpcomingSalary from '@/src/components/page/UpcomingSalary'
import {ShortSalary} from '@/app/page'
import {Skeleton} from '@heroui/react'
import {Day, LTWorker, RankDescription} from '@/src/utils/types'
import {Checkbox, Separator} from '@heroui/react-beta'

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
  console.debug(ranksData[0].data)
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
          </div>
          <div className="flex flex-wrap gap-2 overflow-auto">
            {ranksData.map(rank => (
              <div
                key={rank.rank.id}
                className="border-content1-foreground/20 flex flex-col items-center gap-2 rounded-2xl border-2 p-2">
                <RankIcon rank={rank?.rank.name || ''} className="w-40" />{' '}
                <p>{rank?.rank.name || ''}</p>
                <Separator />
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
