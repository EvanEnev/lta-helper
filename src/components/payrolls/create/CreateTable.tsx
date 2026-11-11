'use client'

import {memo, useState} from 'react'
import CommitNumberInput from '@/src/components/global/CommitNumberInput'
import LazyMount from '@/src/components/global/LazyMount'
import RankIcon from '@/src/components/global/RankIcon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {LTLocation, LTPayrollData} from '@/src/utils/types'

export interface CreateRowInfo {
  name: string
  fio: string
  rank: string
}

export type EditableField =
  | 'location'
  | 'bonuses'
  | 'fines'
  | 'value'
  | 'external_payment'

export interface CreateRowData {
  entry: LTPayrollData
  info: CreateRowInfo
}

interface CreateTableProps {
  rows: CreateRowData[]
  locations: LTLocation[]
  onUpdate: (workerId: number, field: EditableField, value: number) => void
}

const TEMPLATE =
  'minmax(13rem,1.4fr) minmax(10rem,1fr) 7rem 8.5rem 8.5rem 8.5rem 10rem 8rem minmax(13rem,1fr)'

const EDIT =
  'h-9 border-transparent bg-transparent text-right text-base shadow-none hover:border-input focus-visible:border-ring dark:bg-transparent'

const CELL = 'px-3 py-2.5'

const HEAD = 'bg-background flex items-center px-3'

const HEADERS = [
  'Сотрудник',
  'ФИ',
  'Остаток',
  'Сумма',
  'Бонусы',
  'Штрафы',
  'Внешняя выплата',
  'Итог',
  'Локация',
]

export const rowTotal = (entry: LTPayrollData) =>
  (entry.fines || 0) +
  (entry.bonuses || 0) +
  (entry.value || 0) -
  (entry.external_payment || 0) +
  (entry.balance || 0)

const Row = memo(function Row({
  entry,
  info,
  locations,
  onUpdate,
}: CreateRowData & {
  locations: LTLocation[]
  onUpdate: CreateTableProps['onUpdate']
}) {
  const id = entry.workerId
  const total = rowTotal(entry)

  const input = (
    label: string,
    field: EditableField,
    value: number | null | undefined,
  ) => (
    <div className="px-1">
      <CommitNumberInput
        label={label}
        value={value}
        allowNegative
        className={EDIT}
        onCommit={v => onUpdate(id, field, v)}
      />
    </div>
  )

  return (
    <div
      role="row"
      className="bg-background grid items-center border-b text-base transition-colors hover:bg-[color-mix(in_oklab,var(--background)_92%,var(--foreground))]"
      style={{gridTemplateColumns: TEMPLATE}}>
      <div
        role="cell"
        className={cn(
          CELL,
          'sticky left-0 z-10 flex min-w-0 items-center gap-2.5 bg-inherit',
        )}>
        <RankIcon rank={info.rank} className="h-8 w-auto shrink-0" />
        <span className="truncate font-medium">{info.name}</span>
      </div>
      <div
        role="cell"
        className={cn(CELL, 'text-muted-foreground min-w-0 truncate')}
        title={info.fio}>
        {info.fio}
      </div>
      <div role="cell" className={cn(CELL, 'text-right tabular-nums')}>
        {separateNumber(entry.balance || 0)}
      </div>
      {input('Сумма', 'value', entry.value)}
      {input('Бонусы', 'bonuses', entry.bonuses)}
      {input('Штрафы', 'fines', entry.fines)}
      {input('Внешняя выплата', 'external_payment', entry.external_payment)}
      <div
        role="cell"
        className={cn(
          CELL,
          'text-right font-semibold tabular-nums',
          total < 0 && 'text-destructive',
        )}>
        {separateNumber(total)}
      </div>
      <div className="px-2">
        <Select
          value={String(entry.location)}
          items={[
            {value: '-1', label: '—'},
            ...locations.map(l => ({value: String(l.id), label: l.name})),
          ]}
          onValueChange={value =>
            onUpdate(id, 'location', Number(value ?? -1))
          }>
          <SelectTrigger
            className={cn(
              'hover:border-input h-9 w-full border-transparent bg-transparent text-base shadow-none dark:bg-transparent',
              entry.location === -1 && 'text-muted-foreground',
            )}
            aria-label="Локация выдачи">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">—</SelectItem>
            {locations.map(location => (
              <SelectItem key={location.id} value={String(location.id)}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
})

export default function CreateTable({
  rows,
  locations,
  onUpdate,
}: CreateTableProps) {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)

  const sum = (pick: (entry: LTPayrollData) => number) =>
    rows.reduce((acc, row) => acc + pick(row.entry), 0)

  const totals = [
    null,
    null,
    sum(e => e.balance || 0),
    sum(e => e.value || 0),
    sum(e => e.bonuses || 0),
    sum(e => e.fines || 0),
    sum(e => e.external_payment || 0),
    sum(rowTotal),
    null,
  ]

  const numeric = (index: number) => index >= 2 && index <= 7

  return (
    <div
      ref={setScroller}
      role="table"
      className="bg-background relative min-h-0 flex-1 overflow-auto rounded-xl border [contain:inline-size]">
      <div className="min-w-[88rem]">
        <div className="bg-background sticky top-0 z-20">
          <div
            role="row"
            className="grid border-b"
            style={{gridTemplateColumns: TEMPLATE}}>
            {HEADERS.map((title, index) => (
              <div
                key={title}
                role="columnheader"
                className={cn(
                  HEAD,
                  'text-muted-foreground h-11 text-sm font-medium whitespace-nowrap',
                  index === 0 && 'sticky left-0 z-10',
                  numeric(index) && 'justify-end',
                )}>
                {title}
              </div>
            ))}
          </div>
          <div
            role="row"
            className="grid border-b"
            style={{gridTemplateColumns: TEMPLATE}}>
            {totals.map((value, index) => (
              <div
                key={index}
                role="columnheader"
                className={cn(
                  HEAD,
                  'h-10 text-base font-semibold tabular-nums',
                  index === 0 && 'sticky left-0 z-10',
                  numeric(index) && 'justify-end',
                )}>
                {index === 0
                  ? `Итого (${rows.length})`
                  : value === null
                    ? ''
                    : separateNumber(value)}
              </div>
            ))}
          </div>
        </div>

        {rows.map(({entry, info}) => (
          <LazyMount key={entry.workerId} root={scroller} minHeight={53}>
            <Row
              entry={entry}
              info={info}
              locations={locations}
              onUpdate={onUpdate}
            />
          </LazyMount>
        ))}
      </div>
    </div>
  )
}
