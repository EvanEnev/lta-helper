'use client'

import {useMemo, useState} from 'react'
import {DateTime} from 'luxon'
import {CircleCheck, Info, Loader2} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {Alert, AlertTitle} from '@/components/ui/alert'
import {Button} from '@/components/ui/button'
import CommitNumberInput from '@/src/components/global/CommitNumberInput'
import WorkerCombobox from '@/src/components/global/WorkerCombobox'
import fetchHandler from '@/src/utils/global/fetchHandler'
import separateNumber from '@/lib/functions/separateNumber'
import type {
  LTPayrollIssueData,
  LTTakeByPayrollData,
  LTWorker,
} from '@/src/utils/types'

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
  // суммы тех, за кого забираю (меняются только в меньшую сторону)
  const [workersData, setWorkersData] = useState<
    {workerId: LTWorker['id']; value: number}[]
  >([])
  const [payroll, setPayroll] = useState<LTPayrollIssueData | undefined>(
    payrolls[0],
  )
  const [isLoading, setLoading] = useState(false)

  // максимум по модулю - начисленная сумма: отрицательная допустима до своего значения
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

      // сразу показываем подтверждение, не дожидаясь перезагрузки
      if (result) setPayroll(prev => prev && {...prev, issue_confirmed: true})
    } finally {
      setLoading(false)
    }
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
      {payroll.issue_confirmed && (
        <Alert>
          <Info />
          <AlertTitle>Выдача подтверждена</AlertTitle>
        </Alert>
      )}
      {!!payroll.taken && (
        <Alert className="border-success/50">
          <CircleCheck className="text-success" />
          <AlertTitle>Выдано {separateNumber(payroll.taken)} ₽</AlertTitle>
        </Alert>
      )}

      <h1 className="text-xl font-bold">
        Можно получить до{' '}
        <span className="underline">
          {DateTime.fromISO(payroll.take_by).toFormat('dd.MM.yyyy')}
        </span>
      </h1>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">
          Сумма к выдаче (макс.: {separateNumber(max || min)})
        </label>
        <CommitNumberInput
          label="Сумма к выдаче"
          value={payroll.value}
          allowNegative={payable < 0}
          readOnly={!!payroll.taken}
          className="h-10 text-base"
          onCommit={value =>
            setPayroll(
              prev =>
                prev && {...prev, value: Math.min(Math.max(value, min), max)},
            )
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Заберёт</label>
        <WorkerCombobox
          workers={workers}
          value={selectedWorker ?? ''}
          onChange={name => setSelectedWorker(name || null)}
        />
      </div>

      <fieldset className="flex flex-col gap-2 rounded-xl border p-3">
        <legend className="px-1 text-sm font-medium">Забираю за</legend>
        {!takeByWorkers.length && (
          <i className="text-muted-foreground text-sm">Пусто...</i>
        )}
        <Accordion>
          {takeByWorkers.map(data => (
            <AccordionItem key={data.id} value={String(data.id)}>
              <AccordionTrigger className="items-center">
                <span>
                  {data.name}{' '}
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
                    className="h-10 text-base"
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
      </fieldset>

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
