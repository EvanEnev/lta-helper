'use client'

import {LTWorker, LTWorkerData} from '@/src/utils/types'
import WorkersRow from '@/src/components/workers/WorkersRow'
import {useMemo} from 'react'
import checkPermissions from '@/lib/functions/checkPermissions'

interface WorkerPageProps {
  worker: LTWorker
  workers: LTWorkerData[]
}

export default function WorkersPage({worker, workers}: WorkerPageProps) {
  const {maxRankId, minRankId} = useMemo(() => {
    const ranksSet = new Set(workers.map(d => JSON.stringify(d.rank)))

    const ranks = Array.from(ranksSet).map(d => JSON.parse(d))

    const ranksWeights = workers.map(d => d.rank.sortingWeight)
    const maxWeight = Math.max(...ranksWeights)
    const minWeight = Math.min(...ranksWeights)

    const maxId = ranks.find(d => d.sortingWeight === maxWeight)!.id
    const minId = ranks.find(d => d.sortingWeight === minWeight)!.id

    return {maxRankId: maxId, minRankId: minId}
  }, [workers])

  const canEdit: boolean = useMemo(
    () => checkPermissions(['edit_worker_rank'], worker),
    [worker],
  )

  return (
    <main className="h-full p-2">
      <div className="flex h-full flex-col gap-4">
        {workers.map(data => (
          <WorkersRow
            canEdit={canEdit}
            maxRankId={maxRankId}
            minRankId={minRankId}
            key={data.id}
            worker={worker}
            data={data}
          />
        ))}
      </div>
    </main>
  )
}
