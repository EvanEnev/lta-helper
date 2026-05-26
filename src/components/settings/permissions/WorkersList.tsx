'use client'

import type {FC} from 'react'
import {Avatar, Button, SearchField} from '@heroui/react'
import type {WorkerBasic} from '@/src/utils/types'

interface WorkersListProps {
  workers: WorkerBasic[]
  selectedId: number | null
  search: string
  onSearchChange: (v: string) => void
  onSelect: (worker: WorkerBasic) => void
}

const WorkersList: FC<WorkersListProps> = ({
  workers,
  selectedId,
  search,
  onSearchChange,
  onSelect,
}) => {
  const filtered = workers.filter(w =>
    search ? w.name.toLowerCase().includes(search.toLowerCase()) : true,
  )

  return (
    <div className="bg-surface relative flex h-full flex-col overflow-y-auto rounded-2xl">
      <div className="border-divider bg-surface sticky top-0 z-200 shrink-0 border-b p-3">
        <SearchField
          value={search}
          onChange={onSearchChange}
          variant="secondary"
          aria-label="Поиск сотрудника">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Поиск..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>
      <div className="flex flex-col gap-1 p-2">
        {filtered.map(worker => (
          <Button
            variant="tertiary"
            key={worker.id}
            onPress={() => onSelect(worker)}
            className={`flex w-full items-center justify-start gap-3 rounded-lg px-3 py-6 text-left transition-colors ${
              selectedId === worker.id
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-default-100 text-foreground'
            }`}>
            <Avatar size="sm" className="shrink-0">
              <Avatar.Image src={worker.photoUrl || ''} />
              <Avatar.Fallback>{worker.name.slice(0, 2)}</Avatar.Fallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {worker.name}
              </span>
              <span className="text-default-400 truncate text-xs">
                {worker.rank ?? ''}
              </span>
            </div>
          </Button>
        ))}
        {filtered.length === 0 && (
          <p className="text-default-400 py-6 text-center text-sm">
            Ничего не найдено
          </p>
        )}
      </div>
    </div>
  )
}

export default WorkersList
