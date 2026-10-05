'use client'

import {CalendarCheck, Filter, Loader2, Search} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import LocationCombobox from '@/src/components/global/LocationCombobox'
import MonthPicker from '@/src/components/global/MonthPicker'
import Excel from '@/public/icons/Excel'
import type {LTLocation} from '@/src/utils/types'

interface SalaryToolbarProps {
  months: string[]
  month: string
  onMonthChange: (month: string) => void
  locations: LTLocation[] // уже с «Все», если нужно
  locationName: string
  onLocationChange: (name: string) => void
  canViewLocation: boolean
  canViewFull: boolean
  query: string
  onQueryChange: (value: string) => void
  hideEmpty: boolean
  onHideEmptyChange: (value: boolean) => void
  review: boolean
  onReviewChange: (value: boolean) => void
  density: 'full' | 'compact'
  onDensityChange: (value: 'full' | 'compact') => void
  isLoading: boolean
  showToday: boolean
  onToday: () => void
  onDownload: () => void
}

// Фильтры показываются в строке на десктопе и в поповере на телефоне
function Filters(props: SalaryToolbarProps) {
  return (
    <>
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={props.query}
          onChange={event => props.onQueryChange(event.target.value)}
          placeholder="Позывной"
          aria-label="Поиск по позывному"
          className="h-9 pl-8 md:w-44"
        />
      </div>
      <Button
        variant={props.hideEmpty ? 'default' : 'outline'}
        aria-pressed={props.hideEmpty}
        className="h-9"
        onClick={() => props.onHideEmptyChange(!props.hideEmpty)}>
        Скрыть пустые
      </Button>
      {props.canViewFull && (
        <Button
          variant={props.review ? 'default' : 'outline'}
          aria-pressed={props.review}
          className="h-9"
          onClick={() => props.onReviewChange(!props.review)}>
          Проверка
        </Button>
      )}
    </>
  )
}

export default function SalaryToolbar(props: SalaryToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <MonthPicker
        dates={props.months}
        value={props.month}
        onChange={props.onMonthChange}
        className="h-9 w-44"
      />

      {props.canViewLocation && (
        <div className="min-w-44 flex-1 md:max-w-64 md:flex-none">
          <LocationCombobox
            locations={props.locations}
            value={props.locationName}
            onChange={props.onLocationChange}
            placeholder="Локация"
          />
        </div>
      )}

      {props.canViewLocation && (
        <>
          <div className="hidden items-center gap-2 md:flex">
            <Filters {...props} />
          </div>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Фильтры"
                  className="size-9 md:hidden"
                />
              }>
              <Filter />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="flex w-64 flex-col gap-2 p-3">
              <Filters {...props} />
            </PopoverContent>
          </Popover>
        </>
      )}

      {props.isLoading && (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Loader2 className="size-4 animate-spin" />
          <span className="max-sm:hidden">Загрузка</span>
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        <div
          role="group"
          aria-label="Плотность"
          className="bg-muted flex rounded-lg p-0.5">
          {(
            [
              ['full', 'Подробно'],
              ['compact', 'Кратко'],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={props.density === value ? 'default' : 'ghost'}
              aria-pressed={props.density === value}
              className="h-8"
              onClick={() => props.onDensityChange(value)}>
              {label}
            </Button>
          ))}
        </div>
        {props.showToday && (
          <Button variant="outline" className="h-9" onClick={props.onToday}>
            <CalendarCheck />
            <span className="max-sm:hidden">Сегодня</span>
          </Button>
        )}
        {props.canViewFull && (
          <Button variant="outline" className="h-9" onClick={props.onDownload}>
            <Excel width={20} height={20} />
            <span className="max-sm:hidden">Скачать сводную</span>
          </Button>
        )}
      </div>
    </div>
  )
}
