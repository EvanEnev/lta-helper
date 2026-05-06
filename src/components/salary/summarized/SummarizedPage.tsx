'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {DateValue, Key, RangeValue} from '@heroui/react'
import RankIcon from '@/src/components/global/RankIcon'
import {LTLocation, LTRank, LTSalarySummary} from '@/src/utils/types'
import SummarizedHeader from '@/src/components/salary/summarized/SummarizedHeader'
import separateNumber from '@/lib/functions/separateNumber'
import SummarizedRow from '@/src/components/salary/summarized/SummarizedRow'

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

  const [userColumns, setUserColumns] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('summarizedColumns') || '[]')
  })

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

  const allColumns = useMemo(
    () => [
      {
        title: 'Сотрудник',
        sumFn: () => null,
        accessorFn: (workerId: number) => getName(workerId),
      },
      {
        title: 'ЗП',
        sumFn: () => getSum(['value']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['value']),
      },
      {
        title: 'ЗП + Игры',
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
        title: 'Остаток',
        sumFn: () => getSum(['balance']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['balance']),
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
        title: 'Игры',
        sumFn: () => getSum(['games']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['games']),
      },
      {
        title: 'Часовые',
        sumFn: () => getSum(['one_games']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['one_games']),
      },
      {
        title: '2-часовые',
        sumFn: () => getSum(['two_games']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['two_games']),
      },
      {
        title: '3-часовые',
        sumFn: () => getSum(['three_games']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['three_games']),
      },
      {
        title: 'Актёрские',
        sumFn: () => getSum(['actor_games']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['actor_games']),
      },
      {
        title: 'Оф. труд.',
        sumFn: () => getSum(['of']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['of']),
      },
      {
        title: 'Самозянятость',
        sumFn: () => getSum(['self']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['self']),
      },
      {
        title: 'Выдано',
        sumFn: () => getSum(['taken']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['taken']),
      },
      {
        title: 'Итог',
        sumFn: () => getSum(['sum']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['sum']),
      },
    ],
    [getIndividualSum, getName, getSum],
  )

  const defaultColumns: SummaryColumn[] = useMemo(() => {
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
        title: 'Остаток',
        sumFn: () => getSum(['balance']),
        accessorFn: (workerId: number) =>
          getIndividualSum(workerId, ['balance']),
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
        title: 'Оф. труд.',
        sumFn: () => getSum(['of']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['of']),
      },
      {
        title: 'Самозянятость',
        sumFn: () => getSum(['self']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['self']),
      },
      {
        title: 'Выдано',
        sumFn: () => getSum(['taken']),
        accessorFn: (workerId: number) => getIndividualSum(workerId, ['taken']),
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

      setSelectedRanks(newKeys)
    },
    [ranks, selectedRanks],
  )

  useEffect(() => {
    let newData = [...initialData]

    newData = newData.filter(d => selectedRanks.includes(d.rank))

    if (!selectedLocations.includes(0)) {
      newData = newData.filter(
        d => d.value || d.bonuses || d.fines || d.overwork,
      )
    }

    setData(newData)
  }, [selectedRanks, selectedLocations, initialData])

  useEffect(() => {
    localStorage.setItem('summarizedColumns', JSON.stringify(userColumns))
  }, [userColumns])

  const columns = useMemo(() => {
    if (userColumns.length) {
      return allColumns.filter(d => userColumns.includes(d.title))
    }

    return defaultColumns
  }, [allColumns, defaultColumns, userColumns])

  return (
    <main className="flex w-full flex-col gap-4 p-2">
      <SummarizedHeader
        setUserColumns={setUserColumns}
        allColumns={allColumns}
        dateRange={dateRange}
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
