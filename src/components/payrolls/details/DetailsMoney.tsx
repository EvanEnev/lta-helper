'use client'

import Location from '@/src/components/global/Location'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {
  LTMoneyOnLocationsData,
  LTWorkerPayrollData,
} from '@/src/utils/types'

export const payable = (row: LTWorkerPayrollData) =>
  row.value + (row.bonuses || 0) - (row.external_payment || 0)

const sum = (
  rows: LTWorkerPayrollData[],
  pick: (row: LTWorkerPayrollData) => number,
) => rows.reduce((acc, row) => acc + pick(row), 0)

export function locationFigures(
  rows: LTWorkerPayrollData[],
  locationId?: number,
) {
  const scope =
    locationId === undefined
      ? rows
      : rows.filter(r => r.location_id === locationId)

  return {
    toTake: sum(scope, payable),
    issued: sum(scope, r => r.taken || 0),
    balance: sum(scope, r => payable(r) - (r.taken || 0)),
  }
}

function Line({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium tabular-nums', className)}>
        {separateNumber(value)}
      </span>
    </div>
  )
}

function Figures({
  title,
  allocated,
  toTake,
  issued,
  balance,
  location,
}: {
  title: string
  allocated: number
  toTake: number
  issued: number
  balance?: number
  location?: string
}) {
  return (
    <div className="bg-card flex flex-col gap-1.5 rounded-xl border p-3">
      {location ? (
        <Location
          locationName={location}
          iconClassName="w-6"
          className="text-sm"
        />
      ) : (
        <p className="text-sm font-medium">{title}</p>
      )}
      <Line label="Выделено" value={allocated} className="text-primary" />
      <Line label="К выдаче" value={toTake} />
      <Line label="Выдано" value={issued} className="text-success" />
      {balance !== undefined && <Line label="Общий остаток" value={balance} />}
    </div>
  )
}

interface DetailsMoneyProps {
  locationsData: LTMoneyOnLocationsData[]
  data: LTWorkerPayrollData[]
}

export default function DetailsMoney({locationsData, data}: DetailsMoneyProps) {
  const total = locationFigures(data)

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-2">
      {locationsData.map(location => {
        const figures = locationFigures(data, location.location_id)

        return (
          <Figures
            key={location.location_id}
            title={location.location}
            location={location.location}
            allocated={location.value}
            toTake={figures.toTake}
            issued={figures.issued}
          />
        )
      })}
      <Figures
        title="Общее"
        allocated={locationsData.reduce((acc, l) => acc + l.value, 0)}
        toTake={total.toTake}
        issued={total.issued}
        balance={total.balance}
      />
    </div>
  )
}
