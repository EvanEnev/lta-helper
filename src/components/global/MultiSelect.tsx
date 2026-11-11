'use client'

import {useMemo, useState, type ReactNode} from 'react'
import {ChevronDown, Search} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {Input} from '@/components/ui/input'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {cn} from '@/lib/utils'

export interface MultiSelectOption<T extends string | number> {
  value: T
  label: string
  group?: string
  hint?: string
  description?: string
  icon?: ReactNode
}

interface MultiSelectProps<T extends string | number> {
  label: string
  options: MultiSelectOption<T>[]
  value: T[]
  onChange: (value: T[]) => void
  searchable?: boolean
  title?: string
  className?: string
  contentClassName?: string
}

export default function MultiSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
  searchable,
  title,
  className,
  contentClassName,
}: MultiSelectProps<T>) {
  const [query, setQuery] = useState('')
  const selected = useMemo(() => new Set(value), [value])

  const summary =
    value.length === options.length
      ? `${label}: все`
      : value.length === 0
        ? `${label}: ничего`
        : value.length <= 2
          ? options
              .filter(option => selected.has(option.value))
              .map(option => option.label)
              .join(', ')
          : `${label}: ${value.length}`

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()

    return text
      ? options.filter(option => option.label.toLowerCase().includes(text))
      : options
  }, [options, query])

  const toggle = (option: T) =>
    onChange(
      selected.has(option)
        ? value.filter(item => item !== option)
        : [...value, option],
    )

  const groups = useMemo(() => {
    const map = new Map<string, MultiSelectOption<T>[]>()

    for (const option of visible) {
      const key = option.group ?? ''
      map.set(key, [...(map.get(key) ?? []), option])
    }

    return [...map.entries()]
  }, [visible])

  return (
    <Popover onOpenChange={open => !open && setQuery('')}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label={label}
            title={title}
            className={cn('h-9 justify-between gap-2 font-normal', className)}
          />
        }>
        <span className="truncate">{summary}</span>
        <ChevronDown className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn('w-72 gap-2 p-2', contentClassName)}>
        {searchable && (
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Поиск"
              aria-label="Поиск"
              className="h-8 pl-8"
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onChange(options.map(option => option.value))}>
            Выбрать все
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onChange([])}>
            Снять все
          </Button>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {groups.map(([group, items]) => (
            <div key={group} className="flex flex-col">
              {group && (
                <p className="text-muted-foreground px-1.5 pt-2 pb-1 text-xs">
                  {group}
                </p>
              )}
              {items.map(option => (
                <label
                  key={String(option.value)}
                  title={option.hint}
                  className="hover:bg-muted flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1.5 text-sm">
                  <Checkbox
                    className="mt-0.5 self-start"
                    checked={selected.has(option.value)}
                    onCheckedChange={() => toggle(option.value)}
                  />
                  {option.icon}
                  <span className="min-w-0 flex-1">
                    <span
                      className={
                        option.description ? 'block' : 'block truncate'
                      }>
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-muted-foreground block text-xs leading-snug">
                        {option.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          ))}
          {visible.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Ничего не найдено
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
