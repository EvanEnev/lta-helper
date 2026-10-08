'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {DateTime, Interval} from 'luxon'
import {Skeleton} from '@/components/ui/skeleton'
import {cn} from '@/lib/utils'
import RankIcon from '@/src/components/global/RankIcon'
import type {DatePeriod} from '@/src/components/global/DateRangePopover'
import type {MultiSelectOption} from '@/src/components/global/MultiSelect'
import type {LTLocation, LTRank, LTWorkType} from '@/src/utils/types'
import {
  COLUMNS,
  COLUMN_BY_ID,
  PRESETS,
  cellValue,
  migrateColumns,
  type ColumnDef,
  type PresetId,
  type SummaryRow,
} from './columns'
import SummaryTable, {type SortState} from './SummaryTable'
import SummaryToolbar, {type Preset} from './SummaryToolbar'

interface SummaryPageProps {
  ranks: LTRank[]
  locations: LTLocation[]
  workTypes: LTWorkType[]
  initialPreset?: PresetId
}

const ZONE = 'Europe/Moscow'

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

const parseList = (raw: string | null): string[] => {
  try {
    const parsed = raw ? JSON.parse(raw) : []

    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export default function SummaryPage({
  ranks,
  locations,
  workTypes,
  initialPreset,
}: SummaryPageProps) {
  const now = DateTime.now().setZone(ZONE)
  const [period, setPeriod] = useState<DatePeriod>({
    start: now.startOf('month'),
    end: now.endOf('month'),
  })

  const [preset, setPreset] = useState<Preset>(initialPreset ?? 'payouts')
  const [customColumns, setCustomColumns] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = readStorage('summaryPreset')
    const columns = parseList(readStorage('summaryColumns'))

    const fromOld = columns.length
      ? columns
      : migrateColumns(parseList(readStorage('summarizedColumns')), 1).length
        ? migrateColumns(parseList(readStorage('summarizedColumns')), 1)
        : migrateColumns(parseList(readStorage('summarized2Columns')), 2)

    if (fromOld.length) setCustomColumns(fromOld)

    if (!initialPreset) {
      if (saved === 'earnings' || saved === 'payouts') setPreset(saved)
      else if (saved === 'custom' && fromOld.length) setPreset('custom')
      else if (!saved && fromOld.length) setPreset('custom')
    }

    setReady(true)
  }, [initialPreset])

  const columnIds = useMemo(
    () => (preset === 'custom' ? customColumns : PRESETS[preset].columns),
    [preset, customColumns],
  )

  const columns = useMemo(
    () =>
      columnIds
        .map(id => COLUMN_BY_ID.get(id))
        .filter((column): column is ColumnDef => !!column),
    [columnIds],
  )

  const changePreset = (id: PresetId) => {
    writeStorage('summaryPreset', id)
    setPreset(id)
  }

  const changeColumns = (ids: string[]) => {
    const ordered = COLUMNS.map(c => c.id).filter(id => ids.includes(id))

    writeStorage('summaryColumns', JSON.stringify(ordered))
    writeStorage('summaryPreset', 'custom')
    setCustomColumns(ordered)
    setPreset('custom')
  }

  const [selectedRanks, setSelectedRanks] = useState<string[]>(() =>
    ranks.map(r => r.name),
  )
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<number[]>(() =>
    workTypes.map(t => t.id),
  )
  const [selectedLocations, setSelectedLocations] = useState<number[]>(() =>
    locations.map(l => l.id),
  )
  const [query, setQuery] = useState('')
  const [onlyEarned, setOnlyEarned] = useState(true)
  const [sort, setSort] = useState<SortState | null>(null)

  const [rows, setRows] = useState<SummaryRow[]>([])
  const [isLoading, setLoading] = useState(true)
  const requestId = useRef(0)

  useEffect(() => {
    if (!ready) return

    const id = ++requestId.current
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/salary/getSummary', {
          method: 'POST',
          body: JSON.stringify({
            startString: period.start.toFormat('yyyy-MM-dd'),
            endString: period.end.toFormat('yyyy-MM-dd'),
            locations: selectedLocations,
            workTypes: selectedWorkTypes,
          }),
        })

        if (id !== requestId.current) return

        if (response.ok) {
          const json = await response.json()
          if (json.data) setRows(json.data)
        }
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [ready, period, selectedLocations, selectedWorkTypes])

  const view = useMemo(() => {
    const text = query.trim().toLowerCase()

    const filtered = rows.filter(
      row =>
        selectedRanks.includes(row.rank) &&
        (!text || row.workerName.toLowerCase().includes(text)) &&
        (!onlyEarned || row.value || row.bonuses || row.fines || row.overwork),
    )

    const matrix = filtered.map(row =>
      columns.map(column => cellValue(row, column.fields)),
    )

    let order = filtered.map((_, index) => index)

    if (sort) {
      const colIndex = columns.findIndex(c => c.id === sort.id)
      const factor = sort.dir === 'asc' ? 1 : -1

      order = [...order].sort((a, b) =>
        sort.id === 'name'
          ? factor *
            filtered[a].workerName.localeCompare(filtered[b].workerName, 'ru')
          : factor * ((matrix[a][colIndex] ?? 0) - (matrix[b][colIndex] ?? 0)),
      )
    }

    const totals = columns.map((_, index) =>
      matrix.reduce((sum, line) => sum + line[index], 0),
    )

    return {
      rows: order.map(index => filtered[index]),
      values: order.map(index => matrix[index]),
      totals,
    }
  }, [rows, columns, selectedRanks, query, onlyEarned, sort])

  const toggleSort = (id: string) =>
    setSort(prev =>
      prev?.id !== id
        ? {id, dir: id === 'name' ? 'asc' : 'desc'}
        : prev.dir === 'desc' && id !== 'name'
          ? {id, dir: 'asc'}
          : prev.dir === 'asc' && id === 'name'
            ? {id, dir: 'desc'}
            : null,
    )

  const download = useCallback(
    async (type: 'day' | 'month' | 'workers') => {
      const response = await fetch('/api/excel', {
        method: 'POST',
        body: JSON.stringify({
          start_date: period.start.toFormat('yyyy-MM-dd'),
          end_date: period.end.toFormat('yyyy-MM-dd'),
          type,
        }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const interval = Interval.fromDateTimes(period.start, period.end)

      let name = 'Сводная'
      if (type === 'day')
        name += ` по дням (${interval.toFormat('dd.MM.yyyy')})`
      else if (type === 'month') name += ' по месяцам'
      else name += ` по сотрудникам (${interval.toFormat('dd.MM.yyyy')})`

      link.href = url
      link.download = `${name}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    [period],
  )

  const columnOptions = useMemo<MultiSelectOption<string>[]>(
    () =>
      COLUMNS.map(column => ({
        value: column.id,
        label: column.title,
        group: column.group,
        hint: column.hint,
        description: column.sums,
      })),
    [],
  )
  const rankOptions = useMemo<MultiSelectOption<string>[]>(
    () =>
      ranks.map(rank => ({
        value: rank.name,
        label: rank.name,
        icon: <RankIcon rank={rank.name} className="h-5 w-auto" />,
      })),
    [ranks],
  )
  const workTypeOptions = useMemo<MultiSelectOption<number>[]>(
    () => workTypes.map(type => ({value: type.id, label: type.name})),
    [workTypes],
  )
  const locationOptions = useMemo<MultiSelectOption<number>[]>(
    () => locations.map(l => ({value: l.id, label: l.name})),
    [locations],
  )

  return (
    <main
      className={cn(
        'flex min-w-0 flex-col gap-3 p-4',
        'max-sm:h-[calc(100dvh-4rem)] sm:h-dvh',
      )}>
      <SummaryToolbar
        period={period}
        onPeriodChange={setPeriod}
        preset={preset}
        onPresetChange={changePreset}
        columnOptions={columnOptions}
        columnIds={columnIds}
        onColumnsChange={changeColumns}
        rankOptions={rankOptions}
        ranks={selectedRanks}
        onRanksChange={setSelectedRanks}
        workTypeOptions={workTypeOptions}
        workTypes={selectedWorkTypes}
        onWorkTypesChange={setSelectedWorkTypes}
        locationOptions={locationOptions}
        locations={selectedLocations}
        onLocationsChange={setSelectedLocations}
        query={query}
        onQueryChange={setQuery}
        onlyEarned={onlyEarned}
        onOnlyEarnedChange={setOnlyEarned}
        isLoading={isLoading && ready}
        onDownload={download}
      />

      {!ready || (isLoading && rows.length === 0) ? (
        <div className="flex flex-col gap-2">
          {Array.from({length: 8}, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : view.rows.length ? (
        <SummaryTable
          columns={columns}
          rows={view.rows}
          values={view.values}
          totals={view.totals}
          sort={sort}
          onSort={toggleSort}
          isLoading={isLoading}
        />
      ) : (
        <p className="text-muted-foreground py-12 text-center text-sm">
          За выбранный период данных нет
        </p>
      )}
    </main>
  )
}
