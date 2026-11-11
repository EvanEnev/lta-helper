'use client'

import {useMemo, useState} from 'react'
import {DateTime, Interval} from 'luxon'
import {
  CalendarClock,
  CalendarRange,
  Check,
  CircleCheck,
  Loader2,
  HandCoins,
  Users,
  Wallet,
  type LucideIcon,
  UserRound,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import LocationIcon from '@/src/components/global/LocationIcon'
import CommitNumberInput from '@/src/components/global/CommitNumberInput'
import WorkerCombobox from '@/src/components/global/WorkerCombobox'
import fetchHandler from '@/src/utils/global/fetchHandler'
import separateNumber from '@/lib/functions/separateNumber'
import type {
  LTPayrollIssueData,
  LTTakeByPayrollData,
  LTWorker,
} from '@/src/utils/types'
import {cn} from 'cn'

const FIELD = 'bg-muted h-12 border-transparent text-lg font-semibold'
const FIELD_ON_MUTED = 'bg-background h-11 text-base'

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon
  title: string
  hint?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </span>
      <span className="font-medium">{title}</span>
      {hint && (
        <span className="text-muted-foreground ml-auto text-xs">{hint}</span>
      )}
    </div>
  )
}

const STEPS = ['Ожидает', 'Подтверждено', 'Выдано']

interface PayrollIssuePageProps {
  payrolls: LTPayrollIssueData[]
  workers: LTWorker[]
  takeByData: LTTakeByPayrollData[]
  worker: LTWorker
}

export default function PayrollIssuePage({
  payrolls,
  workers,
  takeByData,
  worker,
}: PayrollIssuePageProps) {
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [workersData, setWorkersData] = useState<
    {workerId: LTWorker['id']; value: number}[]
  >([])
  const [payroll, setPayroll] = useState<LTPayrollIssueData | undefined>(
    payrolls[0],
  )
  const [isLoading, setLoading] = useState(false)

  const payable = payrolls[0]?.value || 0
  const [min, max] = payable < 0 ? [payable, 0] : [0, payable]

  const takeByWorkers = useMemo(
    () => takeByData.filter(d => d.payroll_id === payroll?.id),
    [payroll?.id, takeByData],
  )

  const amountFor = (data: LTTakeByPayrollData) =>
    workersData.find(d => d.workerId === data.id)?.value ?? data.to_take

  const confirm = async () => {
    setLoading(true)

    try {
      const result = await fetchHandler({
        url: '/api/payrolls/issue/confirm',
        method: 'POST',
        body: {
          payroll_id: payroll?.id,
          workers: [
            {
              id: worker.id,
              value: payroll?.value || 0,
              selectedWorker: selectedWorker || null,
            },
            ...takeByWorkers.map(w => ({id: w.id, value: amountFor(w)})),
          ],
        },
      })

      if (result) setPayroll(prev => prev && {...prev, issue_confirmed: true})
    } finally {
      setLoading(false)
    }
  }

  const total =
    (payroll?.value ?? 0) +
    takeByWorkers.reduce((sum, w) => sum + amountFor(w), 0)
  const takeBy = DateTime.fromISO(payroll?.take_by ?? '')
  const interval = payroll ? Interval.fromISO(payroll.dates) : null
  const period = interval?.isValid
    ? `${interval.start.toFormat('dd.MM')} – ${interval.end.minus({days: 1}).toFormat('dd.MM.yyyy')}`
    : null
  const step = payroll?.taken ? 3 : payroll?.issue_confirmed ? 2 : 1
  const daysLeft = Math.ceil(
    takeBy.endOf('day').diff(DateTime.now(), 'days').days,
  )
  const deadline = {
    urgent: daysLeft <= 1,
    label:
      daysLeft <= 0
        ? 'Последний день'
        : daysLeft === 1
          ? 'Остался 1 день'
          : `Осталось ${daysLeft} дн.`,
  }

  if (!payroll) {
    return (
      <main className="p-4">
        <p className="text-muted-foreground py-12 text-center text-sm">
          Сейчас нет ведомостей, по которым можно получить зарплату
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-4">
      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-2xl">
                <LocationIcon locationName={payroll.location ?? ''} />
              </div>
              <div className="min-w-0">
                <div className="text-muted-foreground text-xs">Локация</div>
                <div className="truncate text-lg leading-tight font-semibold">
                  {payroll.location || 'Не назначена'}
                </div>
              </div>
            </div>
            <Badge variant={deadline.urgent ? 'destructive' : 'secondary'}>
              {deadline.label}
            </Badge>
          </div>

          <div>
            <div className="text-muted-foreground text-xs">
              {payroll.taken ? 'Выдано' : 'К получению'}
            </div>
            <div className="text-4xl font-bold tabular-nums">
              {separateNumber(payroll.taken || payroll.value)}{' '}
              <span className="text-muted-foreground text-2xl">₽</span>
            </div>
          </div>

          <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
            {period && (
              <div className="flex items-center gap-2">
                <CalendarRange className="size-4 shrink-0" />
                Период: {period}
              </div>
            )}
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 shrink-0" />
              Получить до {takeBy.toFormat('dd.MM.yyyy')}
            </div>
            {payroll.to_take_by && (
              <div className="flex items-center gap-2">
                <UserRound className="size-4 shrink-0" />
                Заберёт: {payroll.to_take_by}
              </div>
            )}
          </div>
        </CardContent>

        <ol className="bg-muted/50 grid grid-cols-3 border-t px-3 py-3">
          {STEPS.map((title, i) => {
            const done = i < step
            const current = i === step - 1

            return (
              <li
                key={title}
                className={cn(
                  'relative flex flex-col items-center gap-1 text-center text-xs',
                  done ? 'text-foreground' : 'text-muted-foreground',
                )}>
                {i > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-3 left-[calc(-50%+18px)] h-0.5 w-[calc(100%-36px)] -translate-y-1/2 rounded-full',
                      i < step ? 'bg-success' : 'bg-border',
                    )}
                  />
                )}
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full border',
                    done && 'bg-success border-success text-success-foreground',
                    current && !payroll.taken && 'border-primary text-primary',
                  )}>
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                {title}
              </li>
            )
          })}
        </ol>
      </Card>

      <Card className="gap-3 p-4">
        <SectionTitle
          icon={Wallet}
          title="Сумма к выдаче"
          hint={`макс. ${separateNumber(max || min)} ₽`}
        />
        <CommitNumberInput
          label="Сумма к выдаче"
          value={payroll.value}
          allowNegative={payable < 0}
          readOnly={!!payroll.taken}
          className={FIELD}
          onCommit={value =>
            setPayroll(
              prev =>
                prev && {...prev, value: Math.min(Math.max(value, min), max)},
            )
          }
        />
        {!payroll.taken && payroll.value !== (max || min) && (
          <Button
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={() =>
              setPayroll(prev => prev && {...prev, value: max || min})
            }>
            Всё: {separateNumber(max || min)} ₽
          </Button>
        )}
      </Card>

      <Card className="gap-3 p-4">
        <SectionTitle icon={HandCoins} title="Кто заберёт" hint="если не вы" />
        <WorkerCombobox
          workers={workers}
          value={selectedWorker ?? ''}
          onChange={name => setSelectedWorker(name || null)}
        />
      </Card>

      <Card className="gap-3 p-4">
        <SectionTitle
          icon={Users}
          title="Забираю за других"
          hint={takeByWorkers.length ? String(takeByWorkers.length) : undefined}
        />
        {!takeByWorkers.length && (
          <p className="bg-muted text-muted-foreground rounded-lg px-3 py-4 text-center text-sm">
            Никто не просил забрать за него
          </p>
        )}
        <Accordion className="flex flex-col gap-2">
          {takeByWorkers.map(data => (
            <AccordionItem
              key={data.id}
              value={String(data.id)}
              className="bg-muted rounded-lg border-b-0 px-3">
              <AccordionTrigger className="items-center">
                <span className="flex w-full items-center justify-between gap-2 pr-2">
                  {data.name}
                  <span className="text-muted-foreground tabular-nums">
                    {separateNumber(amountFor(data))} ₽
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-muted-foreground text-xs">
                    Сумма к выдаче (макс.: {separateNumber(data.to_take)})
                  </span>
                  <CommitNumberInput
                    label={`Сумма к выдаче: ${data.name}`}
                    value={amountFor(data)}
                    readOnly={!!payroll.taken}
                    className={FIELD_ON_MUTED}
                    onCommit={value => {
                      const clamped = Math.min(Math.max(value, 0), data.to_take)

                      setWorkersData(prev =>
                        prev.some(d => d.workerId === data.id)
                          ? prev.map(d =>
                              d.workerId === data.id
                                ? {...d, value: clamped}
                                : d,
                            )
                          : [...prev, {workerId: data.id, value: clamped}],
                      )
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {!payroll.taken && takeByWorkers.length > 0 && (
        <div className="bg-muted flex items-center justify-between rounded-xl px-4 py-3 text-sm">
          <span className="text-muted-foreground">Всего вам на руки</span>
          <span className="font-semibold tabular-nums">
            {separateNumber(total)} ₽
          </span>
        </div>
      )}

      <Button
        size="lg"
        className="h-12 w-full text-base"
        disabled={isLoading || !payroll.id || !!payroll.taken}
        onClick={confirm}>
        {isLoading ? <Loader2 className="animate-spin" /> : <CircleCheck />}
        Подтвердить
      </Button>
    </main>
  )
}
