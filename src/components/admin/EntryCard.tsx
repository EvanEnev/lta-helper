'use client'

import {useMemo} from 'react'
import {
  ChevronDown,
  CircleCheck,
  CircleDashed,
  Clock,
  EyeOff,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader} from '@/components/ui/card'
import getSalaryData from '@/lib/functions/getSalaryData'
import {cn} from '@/lib/utils'
import type {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  LTRank,
  LTWorker,
  LTWorkType,
  WorkerSalary,
} from '@/src/utils/types'
import WorkForm from './WorkForm'
import {TYPED_LOCATION, entryStatus, formatCreatedAt} from './utils'

interface EntryCardProps {
  index: number
  data: WorkerSalary
  user: LTWorker
  workers: LTWorker[]
  ranks: LTRank[]
  locations: LTLocation[]
  workTypes: LTWorkType[]
  gamesPayments: LTGamePayment[]
  faceId: LTFaceIdData[]
  canConfirm: boolean
  isOpen: boolean
  onToggle: () => void
  onChange: (patch: Partial<WorkerSalary>) => void
  onDelete: () => void
  onHide: () => void
}

export default function EntryCard({
  index,
  data,
  user,
  workers,
  ranks,
  locations,
  workTypes,
  gamesPayments,
  faceId,
  canConfirm,
  isOpen,
  onToggle,
  onChange,
  onDelete,
  onHide,
}: EntryCardProps) {
  const worker = workers.find(
    w => w.name?.toLowerCase() === data.worker?.toLowerCase(),
  )
  const location = locations.find(l => l.name === data.location)
  const isTyped = data.location === TYPED_LOCATION
  const isDeleted = !!data.deleted

  const salary = useMemo(() => {
    const rank = ranks.find(r => r.name === worker?.rank)
    if (!rank) return null

    const games = (
      key: 'oneGames' | 'twoGames' | 'threeGames' | 'actorGames',
    ) => ({
      id: data[key]?.id || 0,
      number: data[key]?.number || 0,
    })

    return getSalaryData({
      gamesPayments,
      worker: user,
      rank,
      workingHours: isTyped ? '10-19' : data.workingHours,
      fines: data.fines,
      isHardTime: data.isHardTime,
      comment: data.comment,
      bonuses: data.bonuses,
      oneGames: games('oneGames'),
      twoGames: games('twoGames'),
      threeGames: games('threeGames'),
      actorGames: games('actorGames'),
      override: {
        value: isTyped ? data.value || 0 : data.value,
        overwork: isTyped ? 0 : data.overwork,
        oneGames: data.oneGames?.value,
        twoGames: data.twoGames?.value,
        threeGames: data.threeGames?.value,
        actorGames: data.actorGames?.value,
      },
    })
  }, [
    ranks,
    worker?.rank,
    gamesPayments,
    user,
    isTyped,
    data.workingHours,
    data.fines,
    data.isHardTime,
    data.comment,
    data.bonuses,
    data.value,
    data.overwork,
    data.oneGames,
    data.twoGames,
    data.threeGames,
    data.actorGames,
  ])

  const status = entryStatus(data)

  const statusView = {
    new: {
      icon: CircleDashed,
      className: 'text-muted-foreground',
      text: 'Не проставлена',
    },
    saved: {
      icon: Clock,
      className: 'text-warning',
      text: canConfirm
        ? 'Нужно подтвердить: отправьте ещё раз'
        : 'Подтвердится в день смены',
    },
    confirmed: {
      icon: CircleCheck,
      className: 'text-success',
      text: 'Подтверждена',
    },
  }[status]

  const subtitle = [data.location, !isTyped && data.workingHours]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card
      className={cn('min-w-0 gap-0 py-0', isDeleted && 'ring-destructive/50')}>
      <CardHeader
        className="flex flex-row items-center gap-2 rounded-t-xl p-3"
        style={{
          backgroundColor: location?.color
            ? `color-mix(in srgb, ${location.color} 22%, transparent)`
            : undefined,
        }}>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
          className="focus-visible:ring-ring flex min-w-0 flex-1 items-center gap-2 text-left outline-none focus-visible:ring-2 md:pointer-events-none">
          <span className="bg-background/60 flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {data.worker || 'Не заполнено'}
            </span>
            {subtitle && (
              <span className="text-muted-foreground block truncate text-xs">
                {subtitle}
              </span>
            )}
            {data.worker && (
              <span
                className={cn(
                  'mt-0.5 flex items-center gap-1 text-xs',
                  statusView.className,
                )}>
                <statusView.icon className="size-3.5 shrink-0" />
                <span className="truncate">
                  {statusView.text}
                  {data.createdAt &&
                    ` · проставлена ${formatCreatedAt(data.createdAt)}`}
                </span>
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 shrink-0 transition-transform md:hidden',
              isOpen && 'rotate-180',
            )}
          />
        </button>
        {isDeleted && <Badge variant="destructive">Удалить</Badge>}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={isDeleted ? 'Вернуть запись' : 'Пометить на удаление'}
          title={isDeleted ? 'Вернуть' : 'Удалить'}
          onClick={onDelete}>
          {isDeleted ? <RotateCcw /> : <Trash2 />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Скрыть запись"
          title="Скрыть"
          onClick={onHide}>
          <EyeOff />
        </Button>
      </CardHeader>
      <CardContent
        className={cn(
          'p-3',
          !isOpen && 'max-md:hidden',
          isDeleted && 'opacity-60',
        )}>
        <WorkForm
          data={data}
          salary={salary}
          worker={worker}
          workers={workers}
          locations={locations}
          workTypes={workTypes}
          gamesPayments={gamesPayments}
          faceId={faceId}
          onChange={onChange}
        />
      </CardContent>
    </Card>
  )
}
