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
import {DateTime, Interval} from 'luxon'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useAuth} from '@/src/components/global/providers/authProvider'
import RankIcon from '@/src/components/global/RankIcon'
import {CheckCircle} from 'solar-icon-set'
import fetchHandler from '@/src/utils/global/fetchHandler'

interface PayrollIssuePageProps {
  payrolls: LTPayrollIssueData[]
  workers: LTWorker[]
  takeByData: LTTakeByPayrollData[]
}

export default function PayrollIssuePage({
  payrolls,
  workers,
  takeByData,
}: PayrollIssuePageProps) {
  const {worker, setExiting} = useAuth()

  useEffect(() => {
    setExiting(false)
  }, [setExiting])

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
          value: (payroll?.value || 0) + (payroll?.balance || 0),
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
    payroll?.balance,
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
        <p>
          Ведомость: {Interval.fromISO(payroll?.dates).toFormat('dd.MM.yyyy')}{' '}
          (до {DateTime.fromISO(payroll?.take_by).toFormat('dd.MM.yyyy')})
        </p>
        <NumberInput
          maxValue={(payroll?.value || 0) + (payroll?.balance || 0)}
          label="Сумма к выдаче"
          value={
            (payroll?.value || 0) +
            (payroll?.balance || 0) -
            (payroll?.external_payment || 0)
          }
          onValueChange={value =>
            setPayroll(d => {
              return {...d, balance: 0, value}
            })
          }
        />
        <Autocomplete
          isDisabled={takeByWorkers.length > 0}
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
        <div className="flex flex-col gap-2">
          <p>Забираю за:</p>
          {!takeByWorkers.length && <i>Пусто...</i>}
          <Accordion variant="splitted" itemClasses={{titleWrapper: 'p-0'}}>
            {takeByWorkers.map((data, index) => {
              const workerData = workersData.find(d => d.workerId === data.id)

              return (
                <AccordionItem
                  key={index}
                  title={`${data.name} ${workerData?.value || data.to_take}`}>
                  <NumberInput
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
        </div>
      </div>
      <Button
        onPress={sendConfirm}
        isLoading={isLoading}
        isDisabled={!payrolls[0]?.id}
        className="sticky bottom-4 my-2 h-14 w-full"
        color="primary"
        startContent={<CheckCircle iconStyle="Bold" size={24} />}>
        Подтвердить
      </Button>
    </main>
  )
}
