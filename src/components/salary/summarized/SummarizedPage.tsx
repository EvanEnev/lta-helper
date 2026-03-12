'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {DateValue, RangeValue} from '@heroui/react'
import RankIcon from '@/src/components/global/RankIcon'
import {LTLocation, LTRank, LTSalarySummary} from '@/src/utils/types'
import SummarizedHeader from '@/src/components/salary/summarized/SummarizedHeader'
import separateNumber from '@/lib/functions/separateNumber'
import SummarizedRow from '@/src/components/salary/summarized/SummarizedRow'
import {Key} from '@heroui/react-beta'

export interface SummaryColumn {
  title: string
  sumFn: () => string | null
  accessorFn: (workerId: number) => string | React.ReactNode
}

export default function SummarizedPage({
  ranks,
  locations,
}: {
  ranks: LTRank[]
  locations: LTLocation[]
}) {
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(null)
  const [initialData, setInitialData] = useState<LTSalarySummary[]>([])
  const [data, setData] = useState<LTSalarySummary[]>([])
  const [selectedRanks, setSelectedRanks] = useState<string[]>([
    'all',
    ...ranks.map(r => r.name),
  ])
  const [selectedLocations, setSelectedLocations] = useState<number[]>([
    ...locations.map(l => l.id),
  ])

  useEffect(() => {
    const startString = dateRange?.start.toString()
    const endString = dateRange?.end.toString()

    if (!(startString && endString)) {
      return
    }

    fetch('/api/salary/getSummary', {
      method: 'POST',
      body: JSON.stringify({
        startString,
        endString,
        locations: selectedLocations,
      }),
    }).then(async res => {
      if (res.ok) {
        const data = await res.json()

        if (data.data) {
          setData(data.data)
          setInitialData(data.data)
        }
      }
    })
  }, [dateRange, selectedLocations])

  // const download = useCallback(
  //   async (type: string) => {
  //     const response = await fetch('/api/excel', {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         start_date: dateRange?.start.toString(),
  //         end_date: dateRange?.end.toString(),
  //         type,
  //       }),
  //     })
  //
  //     const blob = await response.blob()
  //     const url = window.URL.createObjectURL(blob)
  //     const a = document.createElement('a')
  //     a.href = url
  //
  //     const interval = Interval.fromISO(
  //       `${dateRange?.start.toString()}/${dateRange?.end.toString()}`,
  //     )
  //
  //     let name = 'Сводная'
  //     if (type === 'day') {
  //       name += ` по дням (${interval.toFormat('dd.MM.yyyy')})`
  //     } else if (type === 'month') {
  //       name += ' по месяцам'
  //     } else if (type === 'workers') {
  //       name += ` по сотрудникам (${interval.toFormat('dd.MM.yyyy')})`
  //     }
  //     a.download = `${name}.xlsx`
  //     document.body.appendChild(a)
  //     a.click()
  //     a.remove()
  //     window.URL.revokeObjectURL(url)
  //   },
  //   [dateRange?.end, dateRange?.start],
  // )

  const getSum = useCallback(
    (names: string[]) => {
      const sum = data.reduce((acc, cur) => {
        return (
          acc +
          names
            .map(name => (typeof cur[name] === 'number' ? cur[name] || 0 : 0))
            .reduce((a, b) => a + b)
        )
      }, 0)

      return separateNumber(sum)
    },
    [data],
  )

  const getIndividualSum = useCallback(
    (workerId: number, names: string[]) => {
      const row = data.find(r => r.workerId === workerId)
      if (!row) return '0'

      const sum = names.reduce(
        (acc, cur) => acc + (typeof row[cur] === 'number' ? row[cur] || 0 : 0),
        0,
      )

      return separateNumber(sum)
    },
    [data],
  )

  const getName = useCallback(
    (workerId: number) => {
      const row = data.find(r => r.workerId === workerId)
      if (!row) return ''

      return (
        <div className="flex items-center gap-2">
          <RankIcon rank={row.rank} />
          <p>{row.workerName}</p>
        </div>
      )
    },
    [data],
  )

  const columns: SummaryColumn[] = useMemo(() => {
    return [
      {
        title: 'Сотрудник',
        sumFn: () => null,
        accessorFn: (workerId: number) => getName(workerId),
      },
      {
        title: 'ЗП',
        sumFn: () => getSum(['value', 'games']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['value', 'games']),
      },
      {
        title: 'Переработка',
        sumFn: () => getSum(['overwork']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['overwork']),
      },
      {
        title: 'Входящий остаток',
        sumFn: () => getSum(['incoming']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['incoming']),
      },
      {
        title: 'Исходящий остаток',
        sumFn: () => getSum(['outcoming']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['outcoming']),
      },
      {
        title: 'ЗП + Переработка',
        sumFn: () => getSum(['value', 'overwork', 'games']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['value', 'overwork', 'games']),
      },
      {
        title: 'Бонусы',
        sumFn: () => getSum(['bonuses']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['bonuses']),
      },
      {
        title: 'Штрафы',
        sumFn: () => getSum(['fines']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['fines']),
      },
      {
        title: 'Бонусы + Штрафы',
        sumFn: () => getSum(['bonuses', 'fines']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['bonuses', 'fines']),
      },
      {
        title: 'Внешняя выплата',
        sumFn: () => getSum(['external']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['external']),
      },
      {
        title: 'Итог',
        sumFn: () => getSum(['sum']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['sum']),
      },
    ]
  }, [getIndividualSum, getName, getSum])

  const updateRank = useCallback(
    (keys: Key[]) => {
      let newKeys = Array.from(keys) as string[]

      const removeAll =
        !newKeys.includes('all') && selectedRanks.includes('all')

      if (
        newKeys.length === ranks.length &&
        !newKeys.includes('all') &&
        !removeAll
      ) {
        newKeys.push('all')
      }

      if (newKeys.includes('all')) {
        if (!selectedRanks.includes('all')) {
          newKeys = ['all', ...ranks.map(r => r.name)]
        }
      }

      if (removeAll) {
        newKeys = []
      }

      console.log({
        removeAll,
        initialDataLength: initialData.length,
        newKeys,
        sampleRanks: initialData.map(d => d.rank),
      })

      setSelectedRanks(newKeys)
      setData(initialData.filter(d => newKeys.includes(d.rank)))
    },
    [initialData, ranks, selectedRanks],
  )

  return (
    <main className="flex w-full flex-col gap-4 p-2">
      <SummarizedHeader
        ranks={ranks}
        updateRank={updateRank}
        selectedRanks={selectedRanks}
        setDateRange={setDateRange}
        columns={columns}
        updateLocations={setSelectedLocations}
      />
      {data.map(row => (
        <SummarizedRow key={row.workerId} data={row} columns={columns} />
      ))}
    </main>
  )
}
