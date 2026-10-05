'use client'

import {useEffect, useState} from 'react'
import {Minus, Plus} from 'lucide-react'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {Input} from '@/components/ui/input'
import {Progress} from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  getRankProgress,
  groupRequirements,
  isRequirementDone,
} from '@/lib/functions/rankProgress'
import {cn} from '@/lib/utils'
import type {LTWorkerData, RankRequirement} from '@/src/utils/types'

interface RequirementsSheetProps {
  worker: LTWorkerData | null
  canEdit: boolean
  side: 'right' | 'bottom'
  onClose: () => void
  onUpdate: (
    workerId: number,
    req: RankRequirement,
    value: number | null,
    toDelete: boolean,
  ) => void
}

interface NumberStepperProps {
  value: number | null
  limit: number | null
  onCommit: (value: number) => void
}

function NumberStepper({value, limit, onCommit}: NumberStepperProps) {
  const current = value ?? 0
  const [draft, setDraft] = useState(String(current))

  // значение могло измениться снаружи (сокет, другой пользователь)
  useEffect(() => setDraft(String(current)), [current])

  const commit = (raw: number) => {
    const next = Number.isFinite(raw) ? Math.max(0, Math.round(raw)) : current
    setDraft(String(next))
    if (next !== current) onCommit(next)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Меньше"
        disabled={current <= 0}
        onClick={() => commit(current - 1)}>
        <Minus />
      </Button>
      <Input
        inputMode="numeric"
        aria-label="Значение"
        className="h-7 w-12 px-1 text-center tabular-nums"
        value={draft}
        onChange={event => setDraft(event.target.value.replace(/\D/g, ''))}
        onBlur={() => commit(Number(draft))}
        onKeyDown={event => event.key === 'Enter' && event.currentTarget.blur()}
      />
      <span className="text-muted-foreground text-sm tabular-nums">
        / {limit}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Больше"
        onClick={() => commit(current + 1)}>
        <Plus />
      </Button>
    </div>
  )
}

interface RequirementRowProps {
  req: RankRequirement
  canEdit: boolean
  onChange: (value: number | null, toDelete: boolean) => void
}

function RequirementRow({req, canEdit, onChange}: RequirementRowProps) {
  // тип select раньше тоже нигде не отображался
  if (req.type === 'select') return null

  const done = isRequirementDone(req)

  const label = (
    <span className="flex min-w-0 flex-1 flex-col">
      <span className={cn(done && 'text-muted-foreground')}>{req.name}</span>
      {req.description && (
        <span className="text-muted-foreground text-xs">{req.description}</span>
      )}
    </span>
  )

  return (
    <li className="flex items-start justify-between gap-3 py-2.5">
      {req.type === 'check' ? (
        <label className="flex min-w-0 flex-1 items-start gap-3">
          <Checkbox
            className="mt-0.5"
            checked={req.done}
            readOnly={!canEdit}
            onCheckedChange={checked => canEdit && onChange(null, !checked)}
          />
          {label}
        </label>
      ) : (
        <>
          {label}
          {canEdit ? (
            <NumberStepper
              value={req.value}
              limit={req.limit}
              onCommit={value => onChange(value, !value)}
            />
          ) : (
            <span
              className={cn(
                'text-sm tabular-nums',
                done ? 'text-success' : 'text-muted-foreground',
              )}>
              {req.value ?? 0} / {req.limit}
            </span>
          )}
        </>
      )}
      {req.meta?.isChoice && <Badge variant="outline">на выбор</Badge>}
    </li>
  )
}

export default function RequirementsSheet({
  worker,
  canEdit,
  side,
  onClose,
  onUpdate,
}: RequirementsSheetProps) {
  const data = worker?.rankData ?? []
  const {plain, categories} = groupRequirements(data)
  const categoryNames = Object.keys(categories)
  const {done, completed, total} = getRankProgress(data)

  const rows = (list: RankRequirement[]) =>
    list.map(req => (
      <RequirementRow
        key={req.id}
        req={req}
        canEdit={canEdit}
        onChange={(value, toDelete) =>
          worker && onUpdate(worker.id, req, value, toDelete)
        }
      />
    ))

  return (
    <Sheet open={!!worker} onOpenChange={open => !open && onClose()}>
      <SheetContent
        side={side}
        className="data-[side=bottom]:max-h-[85dvh] sm:data-[side=right]:max-w-md">
        {worker && (
          <>
            <SheetHeader className="flex-row items-center gap-3 pr-12">
              <Avatar size="lg">
                <AvatarImage src={worker.photoUrl || ''} />
                <AvatarFallback>{worker.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <SheetTitle className="truncate">{worker.name}</SheetTitle>
                <SheetDescription>
                  {worker.rank.name}
                  {!canEdit && ' · только просмотр'}
                </SheetDescription>
              </div>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Прогресс ранга</span>
                  <span className="text-muted-foreground tabular-nums">
                    {completed} / {total}
                  </span>
                </div>
                <Progress
                  value={completed}
                  max={Math.max(total, 1)}
                  className={cn(
                    done && '[&_[data-slot=progress-indicator]]:bg-success',
                  )}
                />
              </div>

              {plain.length > 0 && (
                <ul className="flex flex-col divide-y">{rows(plain)}</ul>
              )}

              {categoryNames.length > 1 && (
                <p className="text-muted-foreground text-xs">
                  Достаточно выполнить одну из категорий
                </p>
              )}
              {categoryNames.map(name => (
                <div key={name} className="bg-muted/50 rounded-lg p-3">
                  <p className="mb-1 font-medium">{name}</p>
                  <ul className="flex flex-col divide-y">
                    {rows(categories[name])}
                  </ul>
                </div>
              ))}

              {/* на телефоне нижняя навигация перекрывает шторку */}
              <div
                aria-hidden
                className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0 md:hidden"
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
