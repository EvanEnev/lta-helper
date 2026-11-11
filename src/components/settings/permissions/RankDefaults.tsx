'use client'

import {useMemo, useState} from 'react'
import {Info, Search} from 'lucide-react'
import {Input} from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {DefaultPermission, Permission} from '@/src/utils/types'

interface RankDefaultsProps {
  permissions: Permission[]
  ranks: {id: number; name: string; weight: number}[]
  defaultPermissions: DefaultPermission[]
  onChange: (permissionId: number, rankId: number | null) => void
}

const NONE = 'none'

export default function RankDefaults({
  permissions,
  ranks,
  defaultPermissions,
  onChange,
}: RankDefaultsProps) {
  const [query, setQuery] = useState('')

  const rules = useMemo(
    () => new Map(defaultPermissions.map(rule => [rule.permission_id, rule])),
    [defaultPermissions],
  )

  const items = useMemo(
    () => [
      {value: NONE, label: 'Никому по рангу'},
      ...ranks.map(rank => ({value: String(rank.id), label: rank.name})),
    ],
    [ranks],
  )

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    if (!text) return permissions

    return permissions.filter(
      permission =>
        permission.description.toLowerCase().includes(text) ||
        permission.name.toLowerCase().includes(text),
    )
  }, [permissions, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/50 flex items-start gap-2.5 rounded-lg p-3 text-sm">
        <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <p className="text-muted-foreground">
          Правило задаёт, с какого ранга право выдаётся автоматически.{' '}
          <span className="text-foreground">
            Изменение сразу действует для всех сотрудников
          </span>{' '}
          этого ранга и старше. Личные права настраиваются на вкладке
          «Сотрудники».
        </p>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Найти право"
          aria-label="Поиск права"
          className="h-9 pl-8"
        />
      </div>

      <ul className="flex flex-col divide-y">
        {visible.map(permission => {
          const rule = rules.get(permission.id)

          return (
            <li
              key={permission.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
              <div className="min-w-0 flex-1 basis-56">
                <p className="text-sm font-medium">{permission.description}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {permission.name}
                </p>
              </div>
              <Select
                value={rule ? String(rule.rank_id) : NONE}
                items={items}
                onValueChange={value =>
                  onChange(
                    permission.id,
                    !value || value === NONE ? null : Number(value),
                  )
                }>
                <SelectTrigger
                  className="w-full sm:w-52"
                  aria-label={`С какого ранга: ${permission.description}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </li>
          )
        })}
        {visible.length === 0 && (
          <li className="text-muted-foreground py-8 text-center text-sm">
            Ничего не найдено
          </li>
        )}
      </ul>
    </div>
  )
}
