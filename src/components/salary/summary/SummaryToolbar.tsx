'use client'

import {Download, Loader2, Search} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import DateRangePopover, {
  type DatePeriod,
} from '@/src/components/global/DateRangePopover'
import MultiSelect, {
  type MultiSelectOption,
} from '@/src/components/global/MultiSelect'
import Excel from '@/public/icons/Excel'
import {cn} from '@/lib/utils'
import {PRESETS, type PresetId} from './columns'

export type Preset = PresetId | 'custom'

interface SummaryToolbarProps {
  period: DatePeriod
  onPeriodChange: (value: DatePeriod) => void
  preset: Preset
  onPresetChange: (value: PresetId) => void
  columnOptions: MultiSelectOption<string>[]
  columnIds: string[]
  onColumnsChange: (value: string[]) => void
  rankOptions: MultiSelectOption<string>[]
  ranks: string[]
  onRanksChange: (value: string[]) => void
  workTypeOptions: MultiSelectOption<number>[]
  workTypes: number[]
  onWorkTypesChange: (value: number[]) => void
  locationOptions: MultiSelectOption<number>[]
  locations: number[]
  onLocationsChange: (value: number[]) => void
  query: string
  onQueryChange: (value: string) => void
  onlyEarned: boolean
  onOnlyEarnedChange: (value: boolean) => void
  isLoading: boolean
  onDownload: (type: 'day' | 'month' | 'workers') => void
}

export default function SummaryToolbar(props: SummaryToolbarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePopover
          value={props.period}
          onChange={props.onPeriodChange}
        />

        <div
          role="group"
          aria-label="Набор колонок"
          className="bg-muted flex rounded-lg p-0.5">
          {(Object.keys(PRESETS) as PresetId[]).map(id => (
            <Button
              key={id}
              size="sm"
              title={PRESETS[id].hint}
              variant={props.preset === id ? 'default' : 'ghost'}
              aria-pressed={props.preset === id}
              className="h-8"
              onClick={() => props.onPresetChange(id)}>
              {PRESETS[id].title}
            </Button>
          ))}
          {props.preset === 'custom' && (
            <Button size="sm" variant="default" className="h-8" disabled>
              Свой набор
            </Button>
          )}
        </div>

        <MultiSelect
          label="Колонки"
          options={props.columnOptions}
          value={props.columnIds}
          onChange={props.onColumnsChange}
          className="w-36"
          contentClassName="w-[26rem] max-w-[calc(100vw-2rem)]"
        />

        {props.isLoading && (
          <Loader2 className="text-muted-foreground size-4 animate-spin" />
        )}

        <div className="ml-auto flex items-center gap-2">
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" className="h-9" aria-label="Excel" />
              }>
              <Excel width={20} height={20} />
              <span className="max-sm:hidden">Excel</span>
              <Download className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 gap-1 p-1.5">
              {(
                [
                  ['day', 'По дням'],
                  ['month', 'По месяцам'],
                  ['workers', 'По сотрудникам'],
                ] as const
              ).map(([type, label]) => (
                <Button
                  key={type}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => props.onDownload(type)}>
                  <Excel width={18} height={18} />
                  {label}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MultiSelect
          label="Ранги"
          options={props.rankOptions}
          value={props.ranks}
          onChange={props.onRanksChange}
          className="w-36"
        />
        <MultiSelect
          label="Типы работ"
          title="Сейчас не влияет на расчёт: фильтр отключён в функции get_salary"
          options={props.workTypeOptions}
          value={props.workTypes}
          onChange={props.onWorkTypesChange}
          className="w-40"
        />
        <MultiSelect
          label="Локации"
          searchable
          options={props.locationOptions}
          value={props.locations}
          onChange={props.onLocationsChange}
          className="w-40"
        />
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={props.query}
            onChange={event => props.onQueryChange(event.target.value)}
            placeholder="Позывной"
            aria-label="Поиск по позывному"
            className="h-9 w-40 pl-8"
          />
        </div>
        <Button
          variant={props.onlyEarned ? 'default' : 'outline'}
          aria-pressed={props.onlyEarned}
          className={cn('h-9')}
          title="Скрыть сотрудников без ЗП, бонусов, штрафов и переработки"
          onClick={() => props.onOnlyEarnedChange(!props.onlyEarned)}>
          Только с начислениями
        </Button>
      </div>
    </div>
  )
}
