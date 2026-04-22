'use client'

import {LTRank, LTWorker, LTWorkerData, RankUpdateData} from '@/src/utils/types'
import WorkersRow from '@/src/components/workers/WorkersRow'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import checkPermissions from '@/lib/functions/checkPermissions'
import {io, Socket} from 'socket.io-client'
import fetchHandler from '@/src/utils/global/fetchHandler'

interface WorkerPageProps {
  worker: LTWorker
  workers: LTWorkerData[]
  ranks: LTRank[]
}

export default function WorkersPage({
  worker,
  workers: initialWorkers,
  ranks,
}: WorkerPageProps) {
  const [workers, setWorkers] = useState(initialWorkers)
  const socketRef = useRef<Socket | null>(null)

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

  useEffect(() => {
    const socket = io()

    socketRef.current = socket

    socket.on('workers_requirements:update', (data: RankUpdateData) => {
      setWorkers(prev =>
        prev.map(row => {
          if (row.id !== (data.workerId || data.oldWorkerId)) return row

          const newRow = {...row}

          let rankReqs = [...newRow.rankData]

          const index = rankReqs.findIndex(
            d => d.id === (data.id || data.oldId),
          )

          if (index === -1) return row

          let reqData = rankReqs[index]

          if (!data.id) {
            reqData = {...reqData, done: false, value: null}
          } else {
            reqData = {
              ...reqData,
              value: reqData.type === 'check' ? null : data.value,
              done:
                reqData.type === 'check' ? true : data.value! >= reqData.limit!,
            }
          }

          rankReqs[index] = reqData

          newRow.rankData = rankReqs

          return newRow
        }),
      )
    })

    return () => {
      socket.off('workers_requirements:update')
      socket.disconnect()
    }
  }, [])

  const updateCallback = useCallback(
    ({
      requirementId,
      workerId,
      value,
      toDelete,
      meta,
    }: {
      requirementId: number
      workerId: number
      value: number | null
      toDelete: boolean
      meta: RankUpdateData['meta']
    }) => {
      const body: RankUpdateData = {
        workerId,
        id: requirementId,
        value,
        delete: toDelete,
        meta,
      }

      socketRef.current?.emit('update:workers_requirements', body)
    },
    [],
  )

  const updateWorkerRank = useCallback(
    async (workerId: number, type: 'promote' | 'demote') => {
      const url = `/api/workers/${type}`

      const res = await fetchHandler({url, method: 'POST', body: {workerId}})

      if (res.newRank) {
        setWorkers(prev => {
          const newList = prev.map(w =>
            w.id === workerId ? {...w, rank: res.newRanks} : w,
          )

          newList.sort((a, b) => {
            const formerA = a.isFormer ?? false
            const formerB = b.isFormer ?? false

            if (formerA !== formerB) return Number(formerA) - Number(formerB)

            const weightA = a.rank.sortingWeight ?? 0
            const weightB = b.rank.sortingWeight ?? 0

            if (weightB !== weightA) return weightB - weightA

            return a.name.localeCompare(b.name)
          })

          return [...newList]
        })
      }
    },
    [],
  )

  return (
    <main className="h-full p-2">
      <div className="flex h-full flex-col gap-4">
        {workers.map(data => (
          <WorkersRow
            ranks={ranks}
            canEdit={canEdit}
            maxRankId={maxRankId}
            minRankId={minRankId}
            key={data.id}
            worker={worker}
            data={data}
            updateCallback={updateCallback}
            updateWorkerRank={updateWorkerRank}
          />
        ))}
      </div>
    </main>
  )
}
