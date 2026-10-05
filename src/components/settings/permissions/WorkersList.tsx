'use client'

import {useMemo, useState} from 'react'
import {Search} from 'lucide-react'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Input} from '@/components/ui/input'
import {cn} from '@/lib/utils'
import type {WorkerBasic} from '@/src/utils/types'

interface WorkersListProps {
  workers: WorkerBasic[]
  selectedId: number | null
  onSelect: (worker: WorkerBasic) => void
  className?: string
}

export default function WorkersList({
  workers,
  selectedId,
  onSelect,
  className,
}: WorkersListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    if (!text) return workers

    return workers.filter(
      worker =>
        worker.name.toLowerCase().includes(text) ||
        (worker.rank ?? '').toLowerCase().includes(text),
    )
  }, [workers, query])

  return (
    <div className={cn('flex min-h-0 flex-col gap-2', className)}>
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Позывной или ранг"
          aria-label="Поиск сотрудника"
          className="h-9 pl-8"
        />
      </div>

      <ul className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {filtered.map(worker => (
          <li key={worker.id}>
            <button
              type="button"
              aria-pressed={selectedId === worker.id}
              onClick={() => onSelect(worker)}
              className={cn(
                'hover:bg-muted focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors outline-none focus-visible:ring-2',
                selectedId === worker.id && 'bg-muted ring-primary/40 ring-1',
              )}>
              <Avatar>
                <AvatarImage src={worker.photoUrl || ''} />
                <AvatarFallback>{worker.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {worker.name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {worker.rank ?? 'Без ранга'}
                </span>
              </span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-muted-foreground py-6 text-center text-sm">
            Никого не найдено
          </li>
        )}
      </ul>
    </div>
  )
}
