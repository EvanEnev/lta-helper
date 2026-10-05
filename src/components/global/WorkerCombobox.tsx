'use client'

import {useMemo} from 'react'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@/components/ui/combobox'
import RankIcon from '@/src/components/global/RankIcon'
import type {LTWorker} from '@/src/utils/types'

interface WorkerComboboxProps {
  workers: LTWorker[]
  value: string // позывной
  onChange: (name: string) => void
}

interface WorkerGroup {
  value: string
  items: LTWorker[]
}

const sameName = (a?: string, b?: string) =>
  (a ?? '').toLowerCase() === (b ?? '').toLowerCase()

// Сотрудники сгруппированы по рангам; бывшие - отдельной группой
export default function WorkerCombobox({
  workers,
  value,
  onChange,
}: WorkerComboboxProps) {
  const groups = useMemo(() => {
    const map = new Map<string, LTWorker[]>()

    for (const worker of workers) {
      const rank = worker.isFormer
        ? 'Бывший сотрудник'
        : worker.rank?.trim() || 'Без ранга'

      map.set(rank, [...(map.get(rank) ?? []), worker])
    }

    return [...map.entries()].map(
      ([rank, items]): WorkerGroup => ({value: rank, items}),
    )
  }, [workers])

  const selected = workers.find(worker => sameName(worker.name, value)) ?? null

  return (
    <Combobox
      items={groups}
      value={selected}
      itemToStringLabel={(worker: LTWorker) => worker.name}
      isItemEqualToValue={(a: LTWorker, b: LTWorker) => a.id === b.id}
      onValueChange={(worker: LTWorker | null) => onChange(worker?.name ?? '')}>
      <ComboboxInput aria-label="Сотрудник" placeholder="Выберите сотрудника" />
      <ComboboxContent>
        <ComboboxEmpty>Никого не найдено</ComboboxEmpty>
        <ComboboxList>
          {(group: WorkerGroup) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel className="flex items-center gap-1.5">
                <RankIcon rank={group.value} className="h-5 w-auto" />
                {group.value}
              </ComboboxLabel>
              <ComboboxCollection>
                {(worker: LTWorker) => (
                  <ComboboxItem key={worker.id} value={worker}>
                    {worker.name}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
