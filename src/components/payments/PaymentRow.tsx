'use client'

import {memo, useState} from 'react'
import {Check, Loader2, Pencil, Trash2, X} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DatePopover from '@/src/components/global/DatePopover'
import NameCombobox from '@/src/components/global/NameCombobox'
import {NumberInput} from '@/src/components/global/NumberInput'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {LTPayment, LTPaymentType} from '@/src/utils/types'

export const ROW_GRID =
  'md:grid-cols-[9rem_minmax(10rem,14rem)_minmax(11rem,14rem)_9rem_minmax(8rem,1fr)_auto]'

interface PaymentRowProps {
  payment: LTPayment
  paymentsTypes: LTPaymentType[]
  workers: string[]
  canEdit: boolean
  onSave: (payment: LTPayment) => Promise<boolean>
  onDelete: (payment: LTPayment) => Promise<void>
  onDiscardNew: (id: number) => void
}

function Cell({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-muted-foreground text-xs md:hidden">{label}</span>
      {children}
    </div>
  )
}

const View = ({children}: {children: React.ReactNode}) => (
  <div className="flex min-h-8 items-center truncate">{children}</div>
)

export default memo(function PaymentRow({
  payment,
  paymentsTypes,
  workers,
  canEdit,
  onSave,
  onDelete,
  onDiscardNew,
}: PaymentRowProps) {
  const [editing, setEditing] = useState(!!payment.create)
  const [draft, setDraft] = useState<LTPayment>(payment)
  const [isSaving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startEdit = () => {
    setDraft(payment)
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    if (payment.create) return onDiscardNew(payment.id)

    setEditing(false)
    setError(null)
  }

  const save = async () => {
    if (!draft.worker?.name) return setError('Выберите сотрудника')
    if (!draft.type) return setError('Выберите тип')
    if (!draft.value) return setError('Укажите сумму')

    setError(null)
    setSaving(true)

    try {
      if (await onSave(draft)) setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className={cn(
        'bg-card grid items-start gap-x-3 gap-y-2 rounded-xl border p-3 md:items-center',
        'grid-cols-1 sm:grid-cols-2',
        ROW_GRID,
        editing && 'ring-primary/40 ring-1',
      )}>
      <Cell label="Дата">
        {editing ? (
          <DatePopover
            label="Дата"
            value={draft.date}
            onChange={date => setDraft(prev => ({...prev, date}))}
            className="h-8 w-full justify-start gap-2 font-normal"
          />
        ) : (
          <View>{payment.date.split('-').reverse().join('.')}</View>
        )}
      </Cell>

      <Cell label="Сотрудник">
        {editing ? (
          <NameCombobox
            label="Сотрудник"
            names={workers}
            value={draft.worker?.name ?? ''}
            placeholder="Выберите сотрудника"
            onChange={name =>
              setDraft(prev => ({
                ...prev,
                worker: {...prev.worker, name} as LTPayment['worker'],
              }))
            }
          />
        ) : (
          <View>{payment.worker?.name}</View>
        )}
      </Cell>

      <Cell label="Тип">
        {editing ? (
          <Select
            value={draft.type || null}
            items={paymentsTypes.map(t => ({value: t.name, label: t.name}))}
            onValueChange={type =>
              setDraft(prev => ({...prev, type: type ?? undefined}))
            }>
            <SelectTrigger className="w-full" aria-label="Тип">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              {paymentsTypes.map(type => (
                <SelectItem key={type.id} value={type.name}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <View>{payment.type}</View>
        )}
      </Cell>

      <Cell label="Сумма">
        {editing ? (
          <NumberInput
            label="Сумма"
            value={draft.value}
            placeholder="0"
            className="h-8"
            onChange={value => setDraft(prev => ({...prev, value}))}
          />
        ) : (
          <View>
            <span className="font-medium tabular-nums">
              {separateNumber(payment.value ?? 0)} ₽
            </span>
          </View>
        )}
      </Cell>

      <Cell label="Комментарий" className="sm:col-span-2 md:col-span-1">
        {editing ? (
          <Input
            aria-label="Комментарий"
            placeholder="Пусто.."
            className="h-8"
            value={draft.comment ?? ''}
            onChange={event =>
              setDraft(prev => ({...prev, comment: event.target.value}))
            }
          />
        ) : (
          <View>
            <span
              className={cn(!payment.comment && 'text-muted-foreground/60')}
              title={payment.comment ?? ''}>
              {payment.comment || '—'}
            </span>
          </View>
        )}
      </Cell>

      <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2 md:col-span-1 md:justify-end">
        {canEdit &&
          (editing ? (
            <>
              <Button size="sm" disabled={isSaving} onClick={save}>
                {isSaving ? <Loader2 className="animate-spin" /> : <Check />}
                Сохранить
              </Button>
              <Button size="sm" variant="outline" onClick={cancel}>
                <X />
                Отменить
              </Button>
              {!payment.create && (
                <Button
                  size="icon-sm"
                  variant="destructive"
                  aria-label="Удалить выплату"
                  onClick={() => onDelete(payment)}>
                  <Trash2 />
                </Button>
              )}
            </>
          ) : (
            <Button size="sm" variant="secondary" onClick={startEdit}>
              <Pencil />
              Изменить
            </Button>
          ))}
      </div>

      {error && (
        <p
          role="alert"
          className="text-destructive text-sm sm:col-span-2 md:col-span-full">
          {error}
        </p>
      )}
    </div>
  )
})
