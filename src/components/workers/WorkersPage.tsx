'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {io, Socket} from 'socket.io-client'
import {Award, Clock, Search, UserMinus, Users} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import StatTile from '@/src/components/global/StatTile'
import {useIsMobile} from '@/hooks/use-mobile'
import checkPermissions from '@/lib/functions/checkPermissions'
import {getRankProgress} from '@/lib/functions/rankProgress'
import fetchHandler from '@/src/utils/global/fetchHandler'
import type {
  LTRank,
  LTWorker,
  LTWorkerData,
  RankRequirement,
  RankUpdateData,
} from '@/src/utils/types'
import ApproveDialog from './ApproveDialog'
import RequirementsSheet from './RequirementsSheet'
import WorkerCard from './WorkerCard'
import {applyRequirementUpdate, matchesQuery, sortWorkers} from './utils'

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
  const router = useRouter()
  const isMobile = useIsMobile()
  const socketRef = useRef<Socket | null>(null)

  const [source, setSource] = useState(initialWorkers)
  const [workers, setWorkers] = useState(initialWorkers)

  // свежие данные с сервера (router.refresh) заменяют локальные
  if (source !== initialWorkers) {
    setSource(initialWorkers)
    setWorkers(initialWorkers)
  }

  const [query, setQuery] = useState('')
  const [rankFilter, setRankFilter] = useState<number | null>(null)
  const [pendingOnly, setPendingOnly] = useState(false)
  const [requirementsId, setRequirementsId] = useState<number | null>(null)
  const [approveId, setApproveId] = useState<number | null>(null)

  const canEdit = useMemo(
    () => checkPermissions(['edit_worker_rank'], worker),
    [worker],
  )

  // «Повысить» недоступно у старшего ранга среди сотрудников, «Понизить» - у младшего
  const {maxRankId, minRankId} = useMemo(() => {
    if (!workers.length) return {maxRankId: null, minRankId: null}

    const byWeight = [...workers].sort(
      (a, b) => (b.rank.sortingWeight ?? 0) - (a.rank.sortingWeight ?? 0),
    )

    return {
      maxRankId: byWeight[0].rank.id,
      minRankId: byWeight[byWeight.length - 1].rank.id,
    }
  }, [workers])

  useEffect(() => {
    const socket = io()
    socketRef.current = socket

    socket.on('workers_requirements:update', (data: RankUpdateData) => {
      setWorkers(prev => applyRequirementUpdate(prev, data))
    })

    return () => {
      socket.off('workers_requirements:update')
      socket.disconnect()
    }
  }, [])

  const updateRequirement = useCallback(
    (
      workerId: number,
      req: RankRequirement,
      value: number | null,
      toDelete: boolean,
    ) => {
      const body: RankUpdateData = {
        workerId,
        id: req.id,
        value,
        delete: toDelete,
        meta: req.meta,
      }

      // сразу показываем результат, сервер подтвердит событием сокета
      setWorkers(prev => applyRequirementUpdate(prev, body))
      socketRef.current?.emit('update:workers_requirements', body)
    },
    [],
  )

  const changeRank = useCallback(
    async (workerId: number, type: 'promote' | 'demote') => {
      const res = await fetchHandler({
        url: `/api/workers/${type}`,
        method: 'POST',
        body: {workerId},
      })

      if (res?.newRank) {
        setWorkers(prev =>
          prev.map(w => (w.id === workerId ? {...w, rank: res.newRank} : w)),
        )
        // требования нового ранга приходят только с сервера
        router.refresh()
      }
    },
    [router],
  )

  const approve = useCallback(async (form: FormData, workerId: number) => {
    const data = {
      ...Object.fromEntries(form),
      workerId: String(workerId),
    }

    const result = await fetchHandler({
      url: '/api/register/approve',
      method: 'POST',
      body: {data},
    })

    if (!result) return false

    setWorkers(prev =>
      prev.map(w => (w.id === workerId ? {...w, ...result} : w)),
    )
    return true
  }, [])

  const sorted = useMemo(() => sortWorkers(workers), [workers])

  const stats = useMemo(
    () => ({
      total: workers.length,
      pending: workers.filter(w => !w.isApproved).length,
      ready: workers.filter(
        w =>
          w.isApproved &&
          !w.isFormer &&
          w.rankData.length > 0 &&
          getRankProgress(w.rankData).done,
      ).length,
      former: workers.filter(w => w.isFormer).length,
    }),
    [workers],
  )

  // фильтры по рангу берём из списка рангов (порядок от старшего), только те, что есть у сотрудников
  const rankChips = useMemo(
    () =>
      ranks
        .map(rank => ({
          ...rank,
          count: workers.filter(w => w.rank.id === rank.id).length,
        }))
        .filter(rank => rank.count > 0),
    [ranks, workers],
  )

  const visible = useMemo(
    () =>
      sorted.filter(
        w =>
          matchesQuery(w, query) &&
          (rankFilter === null || w.rank.id === rankFilter) &&
          (!pendingOnly || !w.isApproved),
      ),
    [sorted, query, rankFilter, pendingOnly],
  )

  const requirementsWorker = workers.find(w => w.id === requirementsId) ?? null
  const approveWorker = workers.find(w => w.id === approveId) ?? null

  return (
    <main className="mx-auto flex w-full max-w-[100rem] min-w-0 flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Users} value={stats.total} label="Сотрудников" />
        <StatTile
          icon={Clock}
          value={stats.pending}
          label="Ждут подтверждения"
          className="text-warning"
        />
        <StatTile
          icon={Award}
          value={stats.ready}
          label="Выполнили ранг"
          className="text-success"
        />
        <StatTile
          icon={UserMinus}
          value={stats.former}
          label="Бывшие"
          className="text-muted-foreground"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Поиск по позывному, ФИО, телефону"
              className="h-9 pl-8"
            />
          </div>
          {stats.pending > 0 && (
            <Button
              variant={pendingOnly ? 'default' : 'outline'}
              className="h-9"
              aria-pressed={pendingOnly}
              onClick={() => setPendingOnly(prev => !prev)}>
              <Clock />
              <span className="hidden sm:inline">Не подтверждены</span>
              <span className="tabular-nums">{stats.pending}</span>
            </Button>
          )}
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 [contain:inline-size]">
          <Button
            size="sm"
            variant={rankFilter === null ? 'default' : 'outline'}
            onClick={() => setRankFilter(null)}>
            Все
            <span className="tabular-nums opacity-70">{workers.length}</span>
          </Button>
          {rankChips.map(rank => (
            <Button
              key={rank.id}
              size="sm"
              variant={rankFilter === rank.id ? 'default' : 'outline'}
              onClick={() =>
                setRankFilter(prev => (prev === rank.id ? null : rank.id))
              }>
              {rank.name}
              <span className="tabular-nums opacity-70">{rank.count}</span>
            </Button>
          ))}
        </div>
      </div>

      {visible.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-4">
          {visible.map(data => (
            <WorkerCard
              key={data.id}
              data={data}
              canEdit={canEdit}
              canApprove={data.invitedBy === worker.id}
              isTopRank={data.rank.id === maxRankId}
              isBottomRank={data.rank.id === minRankId}
              onOpenRequirements={() => setRequirementsId(data.id)}
              onApprove={() => setApproveId(data.id)}
              onRankChange={type => changeRank(data.id, type)}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Никого не найдено
        </p>
      )}

      <RequirementsSheet
        worker={requirementsWorker}
        canEdit={canEdit}
        side={isMobile ? 'bottom' : 'right'}
        onClose={() => setRequirementsId(null)}
        onUpdate={updateRequirement}
      />
      <ApproveDialog
        worker={approveWorker}
        ranks={ranks}
        onClose={() => setApproveId(null)}
        onSubmit={approve}
      />
    </main>
  )
}
