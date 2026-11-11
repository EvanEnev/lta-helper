'use client'

import {useState, type ReactNode} from 'react'
import {
  Clock,
  Gamepad2,
  History,
  MessageSquare,
  ReceiptText,
  ScanFace,
  Trash2,
  Wallet,
} from 'lucide-react'
import {DateTime} from 'luxon'
import {withMask} from 'use-mask-input'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {Textarea} from '@/components/ui/textarea'
import DatePopover from '@/src/components/global/DatePopover'
import FormulaField from '@/src/components/global/FormulaField'
import Location from '@/src/components/global/Location'
import LocationCombobox from '@/src/components/global/LocationCombobox'
import {cn} from '@/lib/utils'
import type {
  LTGamePayment,
  LTLocation,
  SalaryData,
  UserSalary,
} from '@/src/utils/types'
import {evalExpr, visiblePayments, type DayData} from './utils'

const nf = new Intl.NumberFormat('ru-RU')

interface DetailsSheetProps {
  target: {worker: UserSalary['worker']; data: DayData} | null
  canEdit: boolean
  side: 'right' | 'bottom'
  gamesPayments: LTGamePayment[]
  locations: LTLocation[]
  onClose: () => void
  onEdit: (data: SalaryData, workerId: number) => void
  onDelete: (data: SalaryData) => void
}

type GameKey = 'oneGames' | 'twoGames' | 'threeGames' | 'actorGames'

const GAMES: {key: GameKey; label: string}[] = [
  {key: 'oneGames', label: '1-часовые'},
  {key: 'twoGames', label: '2-часовые'},
  {key: 'threeGames', label: '3-часовые'},
  {key: 'actorGames', label: 'Актёрские'},
]

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Clock
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className="text-muted-foreground size-4" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function Value({children}: {children: ReactNode}) {
  return (
    <div className="bg-muted/60 min-h-8 rounded-lg px-2.5 py-1.5 text-sm tabular-nums">
      {children}
    </div>
  )
}

function CommitNumber({
  label,
  value,
  editable,
  suffix = '₽',
  onCommit,
}: {
  label: string
  value: number | null | undefined
  editable: boolean
  suffix?: string
  onCommit: (value: number) => void
}) {
  const current = Number(value) || 0
  const [draft, setDraft] = useState<string | null>(null)

  if (!editable) {
    return (
      <Value>
        {nf.format(current)} {suffix}
      </Value>
    )
  }

  const commit = () => {
    const parsed = parseFloat((draft ?? '').replace(',', '.'))
    setDraft(null)
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed !== current) {
      onCommit(parsed)
    }
  }

  return (
    <Input
      inputMode="decimal"
      aria-label={label}
      className="tabular-nums"
      value={draft ?? String(current)}
      onFocus={event => event.currentTarget.select()}
      onChange={event => {
        if (/^[\d]*[.,]?\d*$/.test(event.target.value)) {
          setDraft(event.target.value)
        }
      }}
      onBlur={commit}
      onKeyDown={event => event.key === 'Enter' && event.currentTarget.blur()}
    />
  )
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

function CommitTime({
  label,
  value,
  editable,
  nullable,
  onCommit,
}: {
  label: string
  value: string | null | undefined
  editable: boolean
  nullable?: boolean
  onCommit: (value: string | null) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const current = (value ?? '').slice(0, 5)

  if (!editable) return <Value>{current || '—'}</Value>

  const commit = () => {
    const text = (draft ?? current).trim()
    setDraft(null)

    if (!text) {
      if (nullable && current) onCommit(null)
    } else if (TIME.test(text) && text !== current) {
      onCommit(`${text}:00`)
    }
  }

  return (
    <Input
      inputMode="numeric"
      placeholder="__:__"
      aria-label={label}
      className="tabular-nums"
      value={draft ?? current}
      ref={withMask('99:99', {inputmode: 'numeric', placeholder: '_'})}
      onChange={event => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={event => event.key === 'Enter' && event.currentTarget.blur()}
    />
  )
}

function DetailsBody({
  worker,
  data,
  canEdit,
  gamesPayments,
  locations,
  onEdit,
  onDelete,
}: Omit<DetailsSheetProps, 'target' | 'side' | 'onClose'> & {
  worker: UserSalary['worker']
  data: DayData
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isShift = !!data.id
  const editable = canEdit && isShift
  const payments = visiblePayments(data)

  const commit = (patch: Partial<SalaryData>) =>
    onEdit({...data, ...patch}, worker.id)

  const gamePayment = (key: GameKey) => gamesPayments.find(d => d.key === key)

  if (!isShift) {
    return (
      <Section icon={Wallet} title="Внешние выплаты">
        <PaymentsList payments={payments} />
      </Section>
    )
  }

  return (
    <>
      <Section icon={Clock} title="Смена">
        <div className="grid grid-cols-2 gap-2">
          <CommitTime
            label="Начало смены"
            value={data.startTime}
            editable={editable}
            onCommit={startTime => startTime && commit({startTime})}
          />
          <CommitTime
            label="Конец смены"
            value={data.endTime}
            editable={editable}
            onCommit={endTime => endTime && commit({endTime})}
          />
        </div>
        <CommitNumber
          label="Сумма за смену"
          value={data.value}
          editable={editable}
          onCommit={value => commit({value})}
        />
      </Section>

      <Section icon={History} title="Переработка">
        <div className="grid grid-cols-2 gap-2">
          <CommitTime
            label="Начало переработки"
            value={data.overworkStart}
            editable={editable}
            nullable
            onCommit={overworkStart => commit({overworkStart})}
          />
          <CommitTime
            label="Конец переработки"
            value={data.overworkEnd}
            editable={editable}
            nullable
            onCommit={overworkEnd => commit({overworkEnd})}
          />
        </div>
        <CommitNumber
          label="Сумма за переработку"
          value={data.overworkValue}
          editable={editable}
          onCommit={overworkValue => commit({overworkValue})}
        />
      </Section>

      <Section icon={Gamepad2} title="Игры">
        <div className="flex flex-col gap-3">
          {GAMES.map(({key, label}) => (
            <div key={key} className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">{label}</span>
              <div className="grid grid-cols-2 gap-2">
                <CommitNumber
                  label={`${label}: количество`}
                  value={data[key]?.number}
                  editable={editable}
                  suffix="шт."
                  onCommit={number => {
                    const payment = gamePayment(key)

                    commit({
                      [key]: {
                        id: payment?.id ?? null,
                        number,
                        value: (payment?.value ?? 0) * number,
                      },
                    } as Partial<SalaryData>)
                  }}
                />
                <CommitNumber
                  label={`${label}: сумма`}
                  value={data[key]?.value}
                  editable={editable}
                  onCommit={value =>
                    commit({
                      [key]: {
                        id: gamePayment(key)?.id ?? null,
                        number: data[key]?.number ?? null,
                        value,
                      },
                    } as Partial<SalaryData>)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={ReceiptText} title="Бонусы и штрафы">
        {editable ? (
          <div className="grid grid-cols-2 gap-2">
            <FormulaField
              label="Бонусы"
              value={data.bonuses || ''}
              onCommit={bonuses => commit({bonuses})}
            />
            <FormulaField
              label="Штрафы"
              value={data.fines || ''}
              onCommit={fines => commit({fines})}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground text-xs">Бонусы</span>
              <Value>{nf.format(evalExpr(data.bonuses))} ₽</Value>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Штрафы</span>
              <Value>{nf.format(evalExpr(data.fines))} ₽</Value>
            </div>
          </div>
        )}
      </Section>

      <Section icon={MessageSquare} title="Комментарий">
        {editable ? (
          <Textarea
            aria-label="Комментарий"
            defaultValue={data.comment || ''}
            onBlur={event => {
              if (event.target.value !== (data.comment || '')) {
                commit({comment: event.target.value})
              }
            }}
          />
        ) : (
          <Value>{data.comment || '—'}</Value>
        )}
      </Section>

      {!!data.faceId?.length && (
        <Section icon={ScanFace} title="FaceID">
          <ul className="flex flex-col gap-1.5">
            {data.faceId.map((mark, index) => (
              <li
                key={index}
                className="bg-muted/60 flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm">
                <Location locationName={mark.location?.name ?? ''} />
                <span className="text-muted-foreground tabular-nums">
                  {mark.timestamp}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {payments.length > 0 && (
        <Section icon={Wallet} title="Внешние выплаты">
          <PaymentsList payments={payments} />
        </Section>
      )}

      {editable && (
        <Section icon={Trash2} title="Управление">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs">Дата смены</span>
            <DatePopover
              label="Дата смены"
              value={DateTime.fromFormat(data.date, 'dd.MM.yyyy').toFormat(
                'yyyy-MM-dd',
              )}
              onChange={value =>
                commit({
                  date: DateTime.fromFormat(value, 'yyyy-MM-dd').toFormat(
                    'dd.MM.yyyy',
                  ),
                })
              }
            />
            <span className="text-muted-foreground text-xs">Локация</span>
            <LocationCombobox
              locations={locations}
              value={data.location?.name ?? ''}
              onChange={name => {
                const location = locations.find(l => l.name === name)
                if (location) commit({location})
              }}
            />
            <Button
              variant="destructive"
              className="mt-2"
              onClick={() => setConfirmDelete(true)}>
              <Trash2 />
              Удалить смену
            </Button>
          </div>
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Удалить смену?</DialogTitle>
                <DialogDescription>
                  {worker.name}, {data.date}. Действие нельзя отменить.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}>
                  Нет
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setConfirmDelete(false)
                    onDelete(data)
                  }}>
                  Да, удалить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>
      )}
    </>
  )
}

function PaymentsList({
  payments,
}: {
  payments: NonNullable<DayData['payments']>
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {payments.map((payment, index) => (
        <li
          key={index}
          className="bg-muted/60 rounded-lg px-2.5 py-1.5 text-sm">
          <div className="flex justify-between gap-2">
            <span>{payment.name}</span>
            <span className="font-medium tabular-nums">
              {nf.format(Number(payment.value) || 0)} ₽
            </span>
          </div>
          {payment.comment && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {payment.comment}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function DetailsSheet({
  target,
  side,
  onClose,
  ...rest
}: DetailsSheetProps) {
  const data = target?.data

  return (
    <Sheet open={!!target} onOpenChange={open => !open && onClose()}>
      <SheetContent
        side={side}
        className="data-[side=bottom]:max-h-[88dvh] sm:data-[side=right]:max-w-md">
        {target && data && (
          <>
            <SheetHeader
              className="rounded-t-xl pr-12"
              style={{
                backgroundColor: data.location?.color
                  ? `color-mix(in srgb, ${data.location.color} 22%, transparent)`
                  : undefined,
              }}>
              <SheetTitle className="flex items-center gap-2">
                {data.location && (
                  <Location locationName={data.location.name} />
                )}
                <span className="text-muted-foreground font-normal">
                  {data.date}
                </span>
              </SheetTitle>
              <SheetDescription>
                {target.worker.name}
                {data.createdBy &&
                  ` · проставлена: ${data.createdBy} ${data.createdAt}`}
              </SheetDescription>
            </SheetHeader>
            <div
              key={`${target.worker.id}-${data.id ?? data.date}`}
              className={cn(
                'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6',
                'max-md:pb-[calc(5rem+env(safe-area-inset-bottom))]',
              )}>
              <DetailsBody worker={target.worker} data={data} {...rest} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
