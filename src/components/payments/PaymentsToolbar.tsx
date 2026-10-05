'use client'

import {Download, Loader2, Plus, Search} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DateRangePopover, {
  type DatePeriod,
} from '@/src/components/global/DateRangePopover'
import type {LTPaymentType} from '@/src/utils/types'

const ALL = 'all'

interface PaymentsToolbarProps {
  period: DatePeriod
  onPeriodChange: (value: DatePeriod) => void
  extraPresets: {label: string; period: DatePeriod}[]
  paymentsTypes: LTPaymentType[]
  type: string // название или 'all'
  onTypeChange: (value: string) => void
  query: string
  onQueryChange: (value: string) => void
  canEdit: boolean
  onCreate: () => void
  onTransfer: () => void
  isTransferring: boolean
  isLoading: boolean
}

export default function PaymentsToolbar(props: PaymentsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {props.canEdit && (
        <Button className="h-9" onClick={props.onCreate}>
          <Plus />
          Создать
        </Button>
      )}

      <DateRangePopover
        value={props.period}
        onChange={props.onPeriodChange}
        extraPresets={props.extraPresets}
      />

      <Select
        value={props.type}
        items={[
          {value: ALL, label: 'Все типы'},
          ...props.paymentsTypes.map(t => ({value: t.name, label: t.name})),
        ]}
        onValueChange={value => props.onTypeChange(value ?? ALL)}>
        <SelectTrigger className="h-9 w-56" aria-label="Тип выплаты">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Все типы</SelectItem>
          {props.paymentsTypes.map(type => (
            <SelectItem key={type.id} value={type.name}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={props.query}
          onChange={event => props.onQueryChange(event.target.value)}
          placeholder="Позывной"
          aria-label="Поиск по позывному"
          className="h-9 w-44 pl-8"
        />
      </div>

      {props.isLoading && (
        <Loader2 className="text-muted-foreground size-4 animate-spin" />
      )}

      {props.canEdit && (
        <Button
          variant="outline"
          className="ml-auto h-9"
          disabled={props.isTransferring}
          title="Подтянуть оплаченные акты самозанятых за выбранный период"
          onClick={props.onTransfer}>
          {props.isTransferring ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Download />
          )}
          Перенести из Консоли
        </Button>
      )}
    </div>
  )
}
