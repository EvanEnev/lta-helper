'use client'

import {memo, useState} from 'react'
import {DateTime} from 'luxon'
import {Loader2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CommitNumberInput from '@/src/components/global/CommitNumberInput'
import Location from '@/src/components/global/Location'
import RankIcon from '@/src/components/global/RankIcon'
import fetchHandler from '@/src/utils/global/fetchHandler'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {LTLocation, LTWorkerPayrollData} from '@/src/utils/types'
import {payable} from './DetailsMoney'

export interface RowPatch {
  value?: number
  bonuses?: number | null
  external_payment?: number | null
  location_id?: number
}

interface DetailsRowProps {
  data: LTWorkerPayrollData
  payrollId: number
  canIssue: boolean
  canEdit: boolean
  locations: LTLocation[]
  sessionLocationId?: number | null
  onEdit: (workerId: number, patch: RowPatch) => void
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      {children}
    </div>
  )
}

const ReadOnly = ({children}: {children: React.ReactNode}) => (
  <div className="bg-muted/60 flex min-h-8 items-center rounded-lg px-2.5 text-sm tabular-nums">
    {children}
  </div>
)

export default memo(function DetailsRow({
  data,
  payrollId,
  canIssue,
  canEdit,
  locations,
  sessionLocationId,
  onEdit,
}: DetailsRowProps) {
  const [isIssuing, setIssuing] = useState(false)
  const id = data.worker.id

  const total = payable(data)
  const left = total - (data.taken || 0)

  const issue = async () => {
    setIssuing(true)

    try {
      await fetchHandler({
        url: '/api/payrolls/issue',
        method: 'POST',
        body: {worker_id: id, value: data.to_take, payroll_id: payrollId},
      })
    } finally {
      setIssuing(false)
    }
  }

  const canPress =
    !!data.issue_confirmed && data.location_id === sessionLocationId

  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-3">
      <div className="flex items-center gap-2">
        <RankIcon rank={data.worker.rank} className="h-8 w-auto shrink-0" />
        <span className="font-medium">{data.worker.name}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <Field label="ЗП">
          {canEdit ? (
            <CommitNumberInput
              label="ЗП"
              value={data.value}
              allowNegative
              onCommit={value => onEdit(id, {value})}
            />
          ) : (
            <ReadOnly>{separateNumber(data.value || 0)} ₽</ReadOnly>
          )}
        </Field>
        <Field label="Бонусы">
          {canEdit ? (
            <CommitNumberInput
              label="Бонусы"
              value={data.bonuses}
              allowNegative
              onCommit={value => onEdit(id, {bonuses: value || null})}
            />
          ) : (
            <ReadOnly>{separateNumber(data.bonuses || 0)} ₽</ReadOnly>
          )}
        </Field>
        <Field label="Внешняя выплата">
          {canEdit ? (
            <CommitNumberInput
              label="Внешняя выплата"
              value={data.external_payment}
              allowNegative
              onCommit={value => onEdit(id, {external_payment: value || null})}
            />
          ) : (
            <ReadOnly>{separateNumber(data.external_payment || 0)} ₽</ReadOnly>
          )}
        </Field>
        <Field label="Локация">
          {canEdit ? (
            <Select
              value={String(data.location_id)}
              items={locations.map(l => ({value: String(l.id), label: l.name}))}
              onValueChange={value =>
                value && onEdit(id, {location_id: Number(value)})
              }>
              <SelectTrigger className="h-8 w-full" aria-label="Локация">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.id} value={String(location.id)}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <ReadOnly>
              <Location
                locationName={
                  locations.find(l => l.id === data.location_id)?.name ?? ''
                }
              />
            </ReadOnly>
          )}
        </Field>
        <Field label="Сумма">
          <ReadOnly>{separateNumber(total)} ₽</ReadOnly>
        </Field>
        <Field label="Остаток">
          <ReadOnly>
            <span className={cn(left < 0 && 'text-destructive')}>
              {separateNumber(left)} ₽
            </span>
          </ReadOnly>
        </Field>
      </div>

      {canIssue && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-3">
          <Button
            className="min-w-32"
            disabled={!canPress || isIssuing}
            variant={
              data.issue_confirmed
                ? 'default'
                : data.taken
                  ? 'secondary'
                  : 'outline'
            }
            onClick={issue}>
            {isIssuing && <Loader2 className="animate-spin" />}
            {data.taken ? 'Выдано' : 'Выдать'}
          </Button>

          {data.taken ? (
            <>
              <div className="text-sm">
                <p className="text-muted-foreground text-xs">Выдано</p>
                <p className="text-success font-medium tabular-nums">
                  {separateNumber(data.taken)} ₽
                </p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground text-xs">Забрал</p>
                <p className="flex items-center gap-1.5">
                  <RankIcon
                    rank={data.taken_by?.rank || ''}
                    className="h-6 w-auto"
                  />
                  {data.taken_by?.name}
                  {data.taken_at && (
                    <span className="text-muted-foreground">
                      ,{' '}
                      {DateTime.fromFormat(
                        data.taken_at,
                        'yyyy-MM-dd HH:mm:ss',
                      ).toFormat('dd.MM.yyyy HH:mm:ss')}
                    </span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm">
                <p className="text-muted-foreground text-xs">К выдаче</p>
                {data.to_take ? (
                  <p className="text-primary font-medium tabular-nums">
                    {separateNumber(data.to_take)} ₽
                  </p>
                ) : (
                  <i className="text-muted-foreground">Не указано</i>
                )}
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground text-xs">Заберёт</p>
                <p className="flex items-center gap-1.5">
                  <RankIcon
                    rank={data.to_take_by?.rank || data.worker.rank || ''}
                    className="h-6 w-auto"
                  />
                  {data.to_take_by?.name || data.worker.name}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})
