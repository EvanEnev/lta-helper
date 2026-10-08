'use client'

import {Input} from '@/components/ui/input'
import Location from '@/src/components/global/Location'
import {safeEvaluate} from '@/src/components/global/FormulaField'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {LTLocation, LTPayrollData} from '@/src/utils/types'

export interface LocationMoney {
  location: LTLocation['id']
  value: number
  error?: boolean
}

interface LocationsMoneyProps {
  locations: LTLocation[]
  hidden: string[]
  money: LocationMoney[]
  payrollData: LTPayrollData[]
  onChange: (location: LTLocation['id'], raw: string) => void
}

export default function LocationsMoney({
  locations,
  hidden,
  money,
  payrollData,
  onChange,
}: LocationsMoneyProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2">
      {locations
        .filter(l => !hidden.includes(l.name.toLowerCase()))
        .map(location => {
          const allocated = money.find(m => m.location === location.id)
          const total = allocated?.value || 0

          const used = payrollData
            .filter(d => d.location === location.id)
            .reduce(
              (sum, d) =>
                sum +
                (d.balance || 0) +
                (d.fines || 0) +
                (d.bonuses || 0) +
                (d.value || 0) -
                (d.external_payment || 0),
              0,
            )

          const left = total - used

          return (
            <div
              key={location.id}
              className="bg-card flex flex-col gap-2 rounded-xl border p-2.5">
              <Location
                locationName={location.name}
                iconClassName="w-6"
                className="text-sm"
              />
              <div className="flex items-center gap-2">
                <Input
                  className="h-8 tabular-nums"
                  inputMode="decimal"
                  aria-label={`Деньги на площадке: ${location.name}`}
                  aria-invalid={allocated?.error}
                  placeholder="0 или формула"
                  defaultValue={total ? String(total) : ''}
                  onChange={event => onChange(location.id, event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      const result = safeEvaluate(event.currentTarget.value)
                      if (result !== null)
                        event.currentTarget.value = String(result)
                    }
                  }}
                />
                <span
                  title="Остаток после выдачи сотрудникам площадки"
                  className={cn(
                    'bg-muted w-24 shrink-0 truncate rounded-lg px-2 py-1.5 text-right text-sm tabular-nums',
                    left < 0 && 'text-destructive',
                  )}>
                  {separateNumber(left)}
                </span>
              </div>
            </div>
          )
        })}
    </div>
  )
}
