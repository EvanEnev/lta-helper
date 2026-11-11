'use client'

import {ArrowDown, ArrowUp} from 'lucide-react'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import RankIcon from '@/src/components/global/RankIcon'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {ColumnDef, SummaryRow} from './columns'

export interface SortState {
  id: string
  dir: 'asc' | 'desc'
}

interface SummaryTableProps {
  columns: ColumnDef[]
  rows: SummaryRow[]
  values: number[][]
  totals: number[]
  sort: SortState | null
  onSort: (id: string) => void
  isLoading: boolean
}

const format = (value: number) => separateNumber(value)

function SortMark({sort, id}: {sort: SortState | null; id: string}) {
  if (sort?.id !== id) return null

  return sort.dir === 'asc' ? (
    <ArrowUp className="size-3" />
  ) : (
    <ArrowDown className="size-3" />
  )
}

export default function SummaryTable({
  columns,
  rows,
  values,
  totals,
  sort,
  onSort,
  isLoading,
}: SummaryTableProps) {
  const head =
    'bg-background text-muted-foreground sticky z-20 h-11 px-3 text-sm font-medium'

  return (
    <div
      className={cn(
        'relative min-h-0 flex-1 overflow-auto rounded-xl border [contain:inline-size]',
        isLoading && 'opacity-60 transition-opacity',
      )}>
      <table className="w-full min-w-max caption-bottom text-base">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead
              className={cn(head, 'top-0 left-0 z-30 min-w-52 pl-3')}
              aria-sort={
                sort?.id === 'name'
                  ? sort.dir === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }>
              <button
                type="button"
                className="flex items-center gap-1"
                onClick={() => onSort('name')}>
                Сотрудник
                <SortMark sort={sort} id="name" />
              </button>
            </TableHead>
            {columns.map(column => (
              <TableHead
                key={column.id}
                title={`${column.title}: ${column.sums}`}
                className={cn(head, 'top-0 text-right')}
                aria-sort={
                  sort?.id === column.id
                    ? sort.dir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }>
                <button
                  type="button"
                  className="ml-auto flex items-center gap-1 whitespace-nowrap"
                  onClick={() => onSort(column.id)}>
                  {column.title}
                  <SortMark sort={sort} id={column.id} />
                </button>
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableHead
              className={cn(
                head,
                'text-foreground top-11 left-0 z-30 h-10 border-b pl-3',
              )}>
              Итого ({rows.length})
            </TableHead>
            {columns.map((column, index) => (
              <TableHead
                key={column.id}
                className={cn(
                  head,
                  'text-foreground top-11 h-10 border-b text-right tabular-nums',
                )}>
                {format(totals[index] ?? 0)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={row.workerId}>
              <TableCell className="bg-background sticky left-0 z-10 pl-3">
                <div className="flex items-center gap-2">
                  <RankIcon rank={row.rank} className="h-7 w-auto shrink-0" />
                  <span className="truncate">{row.workerName}</span>
                  {row.isFormer && (
                    <span className="text-muted-foreground text-sm">
                      бывший
                    </span>
                  )}
                </div>
              </TableCell>
              {columns.map((column, colIndex) => {
                const value = values[rowIndex]?.[colIndex] ?? 0

                return (
                  <TableCell
                    key={column.id}
                    className={cn(
                      'px-3 text-right tabular-nums',
                      value === 0 && 'text-muted-foreground/50',
                      value < 0 && 'text-destructive',
                    )}>
                    {format(value)}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </table>
    </div>
  )
}
