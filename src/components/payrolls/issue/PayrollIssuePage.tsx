'use client'

import {
  LTPayrollIssueData,
  LTTakeByPayrollData,
  LTWorker,
} from '@/src/utils/types'
import {
  Accordion,
  AccordionItem,
  Alert,
  Autocomplete,
  AutocompleteItem,
  Button,
  NumberInput,
} from '@heroui/react'
import {DateTime} from 'luxon'
import {useCallback, useMemo, useState} from 'react'
import RankIcon from '@/src/components/global/RankIcon'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {Icon} from '@iconify/react'

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
  const [selectedWorker, setSelectedWorker] = useState<LTWorker['name'] | null>(
    null,
  )
  const [workersData, setWorkersData] = useState<
    {workerId: LTWorker['id']; value: number}[]
  >([])
  const [payroll, setPayroll] = useState<LTPayrollIssueData>(payrolls[0])
  const [isLoading, setIsLoading] = useState(false)

  const takeByWorkers = useMemo(() => {
    return takeByData.filter(d => d.payroll_id === payroll?.id)
  }, [payroll?.id, takeByData])

  const sendConfirm = useCallback(async () => {
    const body = {
      payroll_id: payroll?.id,
      workers: [
        {
          id: worker.id,
          value: payroll?.value || 0,
          selectedWorker: selectedWorker || null,
        },
        ...takeByWorkers.map(w => {
          const newData = workersData.find(d => d.workerId === w.id)

          if (newData) {
            return {id: newData.workerId, value: newData.value}
          } else {
            return {id: w.id, value: w.to_take}
          }
        }),
      ],
    }

    setIsLoading(true)
    await fetchHandler({
      url: '/api/payrolls/issue/confirm',
      method: 'POST',
      body,
    })
    setIsLoading(false)
  }, [
    payroll?.id,
    payroll?.value,
    selectedWorker,
    takeByWorkers,
    worker.id,
    workersData,
  ])

  return (
    <main className="p-4">
      <div className="flex flex-col gap-2">
        {payroll?.issue_confirmed && (
          <Alert title="Выдача подтверждена" color="success" />
        )}
        {payroll?.taken && (
          <Alert title={`Выдано ${payroll.taken}`} color="success" />
        )}
        <h1 className="text-xl font-bold">
          Можно получить до{' '}
          <span className="underline">
            {DateTime.fromISO(payroll?.take_by).toFormat('dd.MM.yyyy')}
          </span>
        </h1>
        <NumberInput
          isDisabled={!!payroll?.taken}
          maxValue={(payrolls[0]?.value || 0) < 0 ? 0 : payrolls[0]?.value || 0}
          minValue={(payrolls[0]?.value || 0) < 0 ? payrolls[0]?.value || 0 : 0}
          label={`Сумма к выдаче (макс.: ${(payrolls[0]?.value || 0) < 0 ? 0 : payrolls[0]?.value || 0})`}
          value={payroll?.value || 0}
          onValueChange={value =>
            setPayroll(d => {
              return {...d, value}
            })
          }
        />
        <Autocomplete
          isDisabled={!!payroll?.taken}
          label="Заберёт"
          onSelectionChange={key => setSelectedWorker(key?.toString() || null)}
          selectedKey={selectedWorker || ''}>
          {workers.map(worker => (
            <AutocompleteItem
              startContent={<RankIcon className="max-h-8" rank={worker.rank} />}
              key={worker.name}
              title={worker.name}>
              {worker.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>
        <fieldset className="flex flex-col gap-2 rounded-2xl border-2 p-2">
          <legend className="px-1">Забираю за</legend>
          {!takeByWorkers.length && <i>Пусто...</i>}
          <Accordion variant="splitted" itemClasses={{titleWrapper: 'p-0'}}>
            {takeByWorkers.map((data, index) => {
              const workerData = workersData.find(d => d.workerId === data.id)

              return (
                <AccordionItem
                  key={index}
                  title={`${data.name} ${workerData?.value || data.to_take}`}>
                  <NumberInput
                    isDisabled={!!payroll?.taken}
                    maxValue={data.to_take}
                    onValueChange={value => {
                      if (workerData) {
                        setWorkersData(prev =>
                          prev.map(d =>
                            d.workerId === data.id ? {...d, value} : d,
                          ),
                        )
                      } else {
                        setWorkersData(prev => [
                          ...prev,
                          {workerId: data.id, value},
                        ])
                      }
                    }}
                    value={workerData?.value || data.to_take}
                    label="Сумма к выдаче"
                  />
                </AccordionItem>
              )
            })}
          </Accordion>
        </fieldset>
      </div>
      <Button
        onPress={sendConfirm}
        isLoading={isLoading}
        isDisabled={!payrolls[0]?.id || !!payrolls[0]?.taken}
        className="sticky bottom-4 my-2 h-14 w-full"
        color="primary"
        startContent={
          <Icon icon="solar:check-circle-bold" width="24" height="24" />
        }>
        Подтвердить
      </Button>
    </main>
  )
}
