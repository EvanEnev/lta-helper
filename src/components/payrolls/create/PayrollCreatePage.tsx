'use client'

import {
  LTLocation,
  LTPayrollCreateData,
  LTPayrollData,
  LTRank,
  LTWorker,
} from '@/src/utils/types'
import {useCallback, useEffect, useMemo, useState} from 'react'
import PayrollCreateValueCell from '@/src/components/payrolls/create/PayrollCreateValueCell'
import PayrollCreateLocationCell from '@/src/components/payrolls/create/PayrollCreateLocationCell'
import {DateTime} from 'luxon'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {evaluate} from 'mathjs'
import {useRouter} from 'next/navigation'
import separateNumber from '@/lib/functions/separateNumber'
import RankIcon from '@/src/components/global/RankIcon'
import PayrollCreateHeader from '@/src/components/payrolls/create/PayrollCreateHeader'
import PayrollCreateRow from '@/src/components/payrolls/create/PayrollCreateRow'

export interface PayrollColumn {
  title: string
  sumFn: () => string | null
  accessorFn: (workerId: number) => string | React.ReactNode
}

interface PayrollCreatePageProps {
  data: {
    name: LTWorker['name']
    id: LTWorker['id']
    rank: LTRank['name']
    sum: number
    balance: number
    value: number
    overwork: number
    bonuses: number
    fines: number
    external: number
    games: number
    [key: string]: number | string | LTWorker['name'] | LTWorker['id']
  }[]
  dates: {start: string; end: string}
  bonuses: boolean
  moneyOnLocations: {
    location: LTLocation['id']
    value: number
  }[]
  locations: LTLocation[]
}

const locationsToHide = ['выезд', 'отдел продаж']

export default function PayrollCreatePage({
  data: initialData,
  dates: initialDates,
  bonuses: initialBonuses,
  moneyOnLocations: initialMoney,
  locations,
}: PayrollCreatePageProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)

  const [payrollData, setPayrollData] = useState<LTPayrollData[]>(
    JSON.parse(localStorage.getItem('payrollsCreate') || '{}')?.workersData ||
      data.map(d => {
        return {
          workerId: d.id,
          external_payment: d.external,
          location: -1,
          value: d.value + d.overwork + d.games,
          fines: d.fines,
          bonuses: d.bonuses,
          balance: d.balance,
        }
      }),
  )

  const [takeBy, setTakeBy] = useState<string>(
    JSON.parse(localStorage.getItem('payrollsCreate') || '{}')?.takeBy ||
      DateTime.now().plus({day: 7}).toFormat('yyyy-MM-dd'),
  )
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [lastSelectedRow, setLastSelectedRow] = useState<number | null>(null)
  const [moneyOnLocations, setMoneyOnLocations] = useState<
    {
      location: LTLocation['id']
      value: number
      error?: boolean
    }[]
  >(
    JSON.parse(localStorage.getItem('payrollsCreate') || '{}')
      ?.moneyOnLocations || initialMoney,
  )

  const dates = useMemo(
    () =>
      JSON.parse(localStorage.getItem('payrollsCreate') || '{}')?.dates ||
      initialDates,
    [initialDates],
  )

  const bonuses = useMemo(
    () =>
      JSON.parse(localStorage.getItem('payrollsCreate') || '{}')?.bonuses ||
      initialBonuses,
    [initialBonuses],
  )

  const updateLocationMoney = useCallback(
    (locationId: number, rawValue: string) => {
      let value = null
      try {
        value = evaluate(rawValue || '0')
      } catch {}

      setMoneyOnLocations(prev =>
        prev.find(d => d.location === locationId)
          ? prev.map(d =>
              d.location === locationId
                ? value === null
                  ? {location: locationId, value: d.value, error: true}
                  : {location: locationId, value}
                : d,
            )
          : [
              ...prev,
              value === null
                ? {location: locationId, value: undefined, error: true}
                : {location: locationId, value},
            ],
      )
    },
    [],
  )

  useEffect(() => {
    const data = {
      withBonuses: bonuses,
      workersData: payrollData,
      takeBy,
      dates,
      moneyOnLocations,
    }

    localStorage.setItem('payrollsCreate', JSON.stringify(data))
  }, [bonuses, dates, moneyOnLocations, payrollData, takeBy])

  const sendData = useCallback(
    async (isPublished: boolean) => {
      const dataToSend: LTPayrollCreateData = {
        withBonuses: bonuses,
        workersData: payrollData,
        takeBy,
        dates,
        moneyOnLocations,
        isPublished,
        meta: null,
      }

      if (!isPublished) {
        dataToSend.meta = localStorage.getItem('payrollsCreate') || {}
      }

      const result = await fetchHandler({
        url: '/api/payrolls/create',
        method: 'POST',
        body: dataToSend,
      })

      if (result?.id) {
        localStorage.removeItem('payrollsCreate')
        router.push(`/payrolls/${result.id}`)
      }
    },
    [bonuses, dates, moneyOnLocations, payrollData, router, takeBy],
  )

  const handleUpdate = useCallback(
    (
      workerId: LTWorker['id'],
      value: number,
      type: 'location' | 'bonuses' | 'fines' | 'value' | 'external_payment',
    ) => {
      if (type === 'fines' && value > 0) {
        value = -value
      }

      const index = data.findIndex(d => d.id === workerId)

      if (selectedRows.length && selectedRows.includes(index)) {
        const dataToCheck = data.filter((_, index) =>
          selectedRows.includes(index),
        )
        setPayrollData(prev =>
          prev.map(d =>
            dataToCheck.find(d2 => d2.id === d.workerId) !== undefined
              ? {...d, [type]: value}
              : d,
          ),
        )
      } else {
        setPayrollData(prev =>
          prev.map(d => (d.workerId === workerId ? {...d, [type]: value} : d)),
        )
      }
    },
    [data, selectedRows],
  )

  // const checkboxChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
  //     // @ts-ignore
  //     const withShift = e.nativeEvent.shiftKey
  //
  //     if (lastSelectedRow !== null && withShift) {
  //       let selected = [...selectedRows]
  //       for (let i = lastSelectedRow + 1; i <= rowIndex; i++) {
  //         if (selected.includes(i)) {
  //           selected = selected.filter(d => d !== i)
  //         } else {
  //           selected.push(i)
  //         }
  //       }
  //
  //       const newSelected = new Set(selected)
  //
  //       setSelectedRows(Array.from(newSelected))
  //       setLastSelectedRow(null)
  //     } else {
  //       if (!selectedRows.includes(rowIndex)) {
  //         setSelectedRows(prev => [...prev, rowIndex])
  //       } else {
  //         setSelectedRows(prev => prev.filter(d => d !== rowIndex))
  //       }
  //
  //       setLastSelectedRow(rowIndex)
  //     }
  //   },
  //   [lastSelectedRow, selectedRows],
  // )
  //
  // const locationsFilter = useCallback(
  //   (value: boolean) => {
  //     if (!value) {
  //       setData(initialData)
  //     } else {
  //       setData(prev =>
  //         prev.filter(
  //           d => payrollData.find(d2 => d2.workerId === d.id)?.location === -1,
  //         ),
  //       )
  //     }
  //   },
  //   [initialData, payrollData],
  // )

  const getSum = useCallback(
    (names: string[]) => {
      let sum = payrollData.reduce(
        // @ts-ignore
        (acc, data) =>
          acc +
          names
            .map(n => {
              // @ts-ignore
              let value = data[n] || 0

              if (n === 'external_payment' && names.length > 1) {
                value *= -1
              }

              return value
            })
            .reduce((a, b) => a + b, 0),
        0,
      )

      return separateNumber(sum)
    },
    [payrollData],
  )

  const getIndividualSum = useCallback(
    (workerId: number, names: string[]) => {
      const row = payrollData.find(r => r.workerId === workerId)
      if (!row) return '0'

      let sum = names.reduce((acc, n) => {
        // @ts-ignore
        let value = row[n] || 0

        if (n === 'external_payment' && names.length > 1) {
          value *= -1
        }
        return acc + value
      }, 0)

      return separateNumber(sum)
    },
    [payrollData],
  )

  const getName = useCallback(
    (workerId: number) => {
      const row = data.find(r => r.id === workerId)
      if (!row) return ''

      return (
        <div className="flex items-center gap-2">
          <RankIcon rank={row.rank} />
          <p>{row.name}</p>
        </div>
      )
    },
    [data],
  )

  const getFi = useCallback(
    (workerId: number) => {
      const row = data.find(r => r.id === workerId)
      if (!row) return ''

      return (
        <div className="flex items-center justify-center gap-2 text-center whitespace-break-spaces">
          <p>{row.fio}</p>
        </div>
      )
    },
    [data],
  )

  const columns: PayrollColumn[] = useMemo(() => {
    return [
      {
        title: 'Сотрудник',
        sumFn: () => null,
        accessorFn: (workerId: number) => getName(workerId),
      },
      {
        title: 'ФИ',
        sumFn: () => null,
        accessorFn: (workerId: number) => getFi(workerId),
      },
      {
        title: 'Остаток',
        sumFn: () => getSum(['balance']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['balance']),
      },
      {
        title: 'Сумма',
        sumFn: () => getSum(['value']),
        accessorFn: (workerId: number) => (
          <PayrollCreateValueCell
            data={Number(
              getIndividualSum(workerId, ['value']).replaceAll(' ', ''),
            )}
            workerId={workerId}
            callback={handleUpdate}
            type="value"
          />
        ),
      },
      {
        title: 'Бонусы',
        sumFn: () => getSum(['bonuses']),
        accessorFn: (workerId: number) => (
          <PayrollCreateValueCell
            data={Number(
              getIndividualSum(workerId, ['bonuses']).replaceAll(' ', ''),
            )}
            workerId={workerId}
            callback={handleUpdate}
            type="bonuses"
          />
        ),
      },
      {
        title: 'Штрафы',
        sumFn: () => getSum(['fines']),
        accessorFn: (workerId: number) => (
          <PayrollCreateValueCell
            data={Number(
              getIndividualSum(workerId, ['fines']).replaceAll(' ', ''),
            )}
            workerId={workerId}
            callback={handleUpdate}
            type="fines"
          />
        ),
      },
      {
        title: 'Внешняя выплата',
        sumFn: () => getSum(['external_payment']),
        accessorFn: (workerId: number) => (
          <PayrollCreateValueCell
            data={Number(
              getIndividualSum(workerId, ['external_payment']).replaceAll(
                ' ',
                '',
              ),
            )}
            workerId={workerId}
            callback={handleUpdate}
            type="external_payment"
          />
        ),
      },
      {
        title: 'Итог',
        sumFn: () =>
          getSum(['fines', 'bonuses', 'value', 'external_payment', 'balance']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, [
            'fines',
            'bonuses',
            'value',
            'external_payment',
            'balance',
          ]),
      },
      {
        title: 'Локация',
        sumFn: () => null,
        accessorFn: (workerId: number) => {
          const payrollWorkerData = payrollData.find(
            d => d.workerId === workerId,
          )

          return (
            <PayrollCreateLocationCell
              locationId={payrollWorkerData?.location || -1}
              locations={locations}
              callback={handleUpdate}
              workerId={workerId}
            />
          )
        },
      },
    ]
  }, [
    getFi,
    getIndividualSum,
    getName,
    getSum,
    handleUpdate,
    locations,
    payrollData,
  ])

  return (
    <main className="h-full w-full p-4">
      <div className="flex flex-col gap-4">
        <div className="bg-content1 flex flex-col gap-2 rounded-2xl">
          <PayrollCreateHeader
            locations={locations}
            dates={dates}
            bonuses={bonuses}
            moneyOnLocations={moneyOnLocations}
            payrollData={payrollData}
            locationsToHide={locationsToHide}
            updateLocationMoney={updateLocationMoney}
            sendData={sendData}
            takeBy={takeBy}
            setTakeBy={setTakeBy}
            columns={columns}
          />
          {payrollData.map(data => (
            <PayrollCreateRow
              key={data.workerId}
              data={data}
              columns={columns}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
