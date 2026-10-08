'use client'

import {
  ChevronDown,
  CircleCheck,
  CircleX,
  Loader2,
  Save,
  Send,
  Shuffle,
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import DatePopover from '@/src/components/global/DatePopover'
import LocationCombobox from '@/src/components/global/LocationCombobox'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {LTLocation} from '@/src/utils/types'

interface CreateToolbarProps {
  locationOptions: LTLocation[]
  locationName: string
  onLocationChange: (name: string) => void
  onlyEmpty: boolean
  onOnlyEmptyChange: (value: boolean) => void
  isDistributing: boolean
  onDistribute: () => void
  periodLabel: string
  bonuses: boolean
  moneyTotal: number
  moneyOpen: boolean
  onMoneyToggle: () => void
  takeBy: string
  onTakeByChange: (value: string) => void
  isSaving: boolean
  onSave: () => void
  onPublish: () => void
}

export default function CreateToolbar(props: CreateToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-52">
        <LocationCombobox
          locations={props.locationOptions}
          value={props.locationName}
          onChange={props.onLocationChange}
          placeholder="Локация"
        />
      </div>
      <Button
        variant={props.onlyEmpty ? 'default' : 'outline'}
        aria-pressed={props.onlyEmpty}
        className="h-9"
        title="Показать только сотрудников без площадки"
        onClick={() => props.onOnlyEmptyChange(!props.onlyEmpty)}>
        Пустые
      </Button>
      <Button
        variant="secondary"
        className="h-9"
        disabled={props.isDistributing}
        title="Автоматически распределить сотрудников по площадкам"
        onClick={props.onDistribute}>
        {props.isDistributing ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Shuffle />
        )}
        Распределить
      </Button>

      <Button
        variant="ghost"
        className="h-9 gap-3"
        aria-expanded={props.moneyOpen}
        onClick={props.onMoneyToggle}>
        <span className="underline">{props.periodLabel}</span>
        <span className="flex items-center gap-1">
          Бонусы:
          {props.bonuses ? (
            <CircleCheck className="text-success size-4" />
          ) : (
            <CircleX className="text-destructive size-4" />
          )}
        </span>
        <span>
          Площадки:{' '}
          <span className="text-primary tabular-nums">
            {separateNumber(props.moneyTotal)} ₽
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 transition-transform',
            props.moneyOpen && 'rotate-180',
          )}
        />
      </Button>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm max-sm:hidden">
            Выдача до
          </span>
          <DatePopover
            label="Дата выдачи"
            value={props.takeBy}
            onChange={props.onTakeByChange}
            className="h-9 justify-start gap-2 font-normal"
          />
        </div>
        <Button
          variant="outline"
          className="h-9"
          disabled={props.isSaving}
          onClick={props.onSave}>
          <Save />
          Сохранить
        </Button>
        <Button
          className="h-9"
          disabled={props.isSaving}
          onClick={props.onPublish}>
          <Send />
          Опубликовать
        </Button>
      </div>
    </div>
  )
}
