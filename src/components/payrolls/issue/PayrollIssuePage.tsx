'use client'

import {
  LTPayrollIssueData,
  LTTakeByPayrollData,
  LTWorker,
} from '@/src/utils/types'
import {
  Accordion,
  Alert,
  Autocomplete,
  Button,
  Header,
  Label,
  ListBox,
  NumberField,
  SearchField,
  Separator,
  useFilter,
} from '@heroui/react'
import {DateTime} from 'luxon'
import {useCallback, useMemo, useState} from 'react'
import RankIcon from '@/src/components/global/RankIcon'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {Icon} from '@iconify/react'
import groupBy from '@/lib/functions/groupBy'

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
  const {contains} = useFilter()
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

  const groupedWorkers: {[key: string]: LTWorker[]} = useMemo(() => {
    const newWorkers = [...workers].map(w => ({
      ...w,
      rank: w.isFormer ? 'Бывший сотрудник' : w.rank?.trim(),
    }))

    return groupBy(newWorkers, 'rank')
  }, [workers])

  return (
    <main className="flex flex-col gap-2 p-4 sm:items-center">
      <div className="flex flex-col gap-2 sm:w-80">
        {payroll?.issue_confirmed && (
          <Alert status="accent">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Выдача подтверждена</Alert.Title>
            </Alert.Content>
          </Alert>
        )}
        {payroll?.taken && (
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Выдано {payroll.taken}</Alert.Title>
            </Alert.Content>
          </Alert>
        )}
        <h1 className="text-xl font-bold">
          Можно получить до{' '}
          <span className="underline">
            {DateTime.fromISO(payroll?.take_by).toFormat('dd.MM.yyyy')}
          </span>
        </h1>
        <NumberField
          variant="secondary"
          className="min-w-36 flex-1"
          isDisabled={!!payroll?.taken}
          maxValue={(payrolls[0]?.value || 0) < 0 ? 0 : payrolls[0]?.value || 0}
          minValue={(payrolls[0]?.value || 0) < 0 ? payrolls[0]?.value || 0 : 0}
          isWheelDisabled
          value={payroll?.value || 0}
          onChange={value =>
            setPayroll(d => {
              return {...d, value}
            })
          }>
          <Label>
            Сумма к выдаче (макс.:{' '}
            {(payrolls[0]?.value || 0) < 0 ? 0 : payrolls[0]?.value || 0})
          </Label>
          <NumberField.Group className="flex px-2">
            <NumberField.Input className="flex-1" />
            <Icon icon="solar:ruble-bold" width="24" height="24" />
          </NumberField.Group>
        </NumberField>
        <Autocomplete
          variant="secondary"
          fullWidth
          value={selectedWorker || ''}
          onChange={key => setSelectedWorker(key?.toString() || null)}>
          <Label>Заберёт</Label>
          <Autocomplete.Trigger>
            <Autocomplete.Value />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <Autocomplete.Filter filter={contains}>
              <SearchField autoFocus name="search" variant="secondary">
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox>
                {Object.entries(groupedWorkers).map(([key, value], index) => {
                  const title = (
                    <div className="z-100 flex flex-1 items-center gap-1 select-none">
                      <RankIcon rank={key} className="h-6" /> {key}
                    </div>
                  )

                  return (
                    <>
                      <ListBox.Section key={index}>
                        <Header>{key === 'null' ? '' : title}</Header>
                        {value.map(worker => (
                          <ListBox.Item
                            textValue={worker.name}
                            id={worker.name}
                            key={worker.name}>
                            {worker.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox.Section>
                      {index !== Object.entries(groupedWorkers).length - 1 && (
                        <Separator />
                      )}
                    </>
                  )
                })}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </Autocomplete>
        <fieldset className="flex flex-col gap-2 rounded-2xl border-2 p-2">
          <legend className="px-1">Забираю за</legend>
          {!takeByWorkers.length && <i>Пусто...</i>}
          <Accordion variant="surface">
            {takeByWorkers.map((data, index) => {
              const workerData = workersData.find(d => d.workerId === data.id)

              return (
                <Accordion.Item key={index}>
                  <Accordion.Heading>
                    <Accordion.Trigger>
                      {data.name} {workerData?.value || data.to_take}
                      <Accordion.Indicator>
                        <Icon
                          icon="solar:alt-arrow-down-linear"
                          width="24"
                          height="24"
                        />
                      </Accordion.Indicator>
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <NumberField
                    variant="secondary"
                    isReadOnly={!!payroll?.taken}
                    className="min-w-36 flex-1"
                    maxValue={data.to_take}
                    isWheelDisabled
                    onChange={value => {
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
                    value={workerData?.value || data.to_take}>
                    <Label>Сумма к выдаче</Label>
                    <NumberField.Group className="flex px-2">
                      <NumberField.Input className="flex-1" />
                      <Icon icon="solar:ruble-bold" width="24" height="24" />
                    </NumberField.Group>
                  </NumberField>
                </Accordion.Item>
              )
            })}
          </Accordion>
        </fieldset>
      </div>
      <Button
        onPress={sendConfirm}
        isPending={isLoading}
        isDisabled={!payrolls[0]?.id || !!payrolls[0]?.taken}
        className="sticky h-12 w-full sm:w-80"
        variant="primary"
        slot="icon">
        <Icon icon="solar:check-circle-bold" width="24" height="24" />
        Подтвердить
      </Button>
    </main>
  )
}
