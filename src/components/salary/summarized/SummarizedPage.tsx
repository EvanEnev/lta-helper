'use client'

import {Fragment, useCallback, useEffect, useMemo, useState} from 'react'
import {
  Button,
  Checkbox,
  Code,
  DateRangePicker,
  DateValue,
  Divider,
  RangeValue,
  Select,
  SelectItem,
} from '@heroui/react'
import groupBy from '@/lib/functions/groupBy'
import {evaluate} from 'mathjs'
import {flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import CellChip from '@/src/components/salary/CellChip'
import RankIcon from '@/src/components/global/RankIcon'
import {LTLocation, LTRank} from '@/src/utils/types'
import salarySort from '@/lib/functions/salarySort'
import useIsMobile from '@/src/hooks/useIsMobile'
import Excel from '@/public/icons/Excel'
import {Interval} from 'luxon'
import {useAtomValue} from 'jotai'
import {headerSizesAtom} from '@/src/utils/global/atoms'

export default function SummarizedPage({
  ranks,
  locations,
}: {
  ranks: LTRank[]
  locations: LTLocation[]
}) {
  const isMobile = useIsMobile()
  const headerSizes = useAtomValue(headerSizesAtom)
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(null)
  const [bonuses, setBonuses] = useState<boolean>(false)
  const [initialData, setInitialData] = useState([])
  const [data, setData] = useState(initialData)
  const [selectedRow, setSelectedRow] = useState<string>()
  const [hiddenColumns, setHiddenColumns] = useState<string[]>()
  const [selectedRanks, setSelectedRanks] = useState<string[]>([
    'all',
    ...ranks.map(r => r.name),
  ])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    'all',
    ...locations.map(l => l.name),
  ])

  const render = useCallback((data: any) => {
    return <CellChip className="text-medium! h-fit p-2">{data}</CellChip>
  }, [])

  const renderName = useCallback((data: any) => {
    return (
      <CellChip className="text-medium! h-fit p-2 break-all">
        <RankIcon rank={data.rank} /> {data.name}
      </CellChip>
    )
  }, [])

  useEffect(() => {
    const localHiddenColumns = localStorage.getItem('hiddenColumns')

    if (localHiddenColumns) {
      const array = localHiddenColumns.split(',')
      setHiddenColumns(array)
    }
  }, [])

  const initialColumns = useMemo(() => {
    return [
      {
        header: 'Сотрудник',
        accessorKey: 'user',
        cell: ({getValue}: {getValue: () => any}) => renderName(getValue()),
      },
      {
        header: 'ЗП',
        key: 'salary',
        accessorFn: (row: any) => {
          let value = 0

          row.salaryData
            .filter((d: any) => selectedLocations.includes(d.location))
            .forEach((d: any) => {
              value += d.salary
            })

          return value
        },
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'Переработка',
        key: 'overwork',
        accessorFn: (row: any) => {
          let value = 0

          row.salaryData
            .filter((d: any) => selectedLocations.includes(d.location))
            .forEach((d: any) => {
              value += d.overwork
            })

          return value
        },
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'Остаток',
        key: 'balance',
        accessorFn: (row: any) => {
          return row.balance
        },
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'Итог',
        key: 'together',
        accessorFn: (row: any) => {
          let value = 0

          row.salaryData
            .filter((d: any) => selectedLocations.includes(d.location))
            .forEach((d: any) => {
              value += d.salary + d.overwork
            })

          return value + (row.balance || 0)
        },
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'Бонусы',
        key: 'bonuses',
        accessorFn: (row: any) => {
          let value = 0

          row.salaryData
            .filter((d: any) => selectedLocations.includes(d.location))
            .forEach((d: any) => {
              value += d.bonuses
            })

          return value
        },
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'Штрафы',
        key: 'fines',
        accessorFn: (row: any) => {
          let value = 0

          row.salaryData
            .filter((d: any) => selectedLocations.includes(d.location))
            .forEach((d: any) => {
              value += d.fines
            })

          return value
        },
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'Бонусы + Штрафы',
        key: 'bonusesfines',
        accessorFn: (row: any) => {
          let value = 0

          row.salaryData
            .filter((d: any) => selectedLocations.includes(d.location))
            .forEach((d: any) => {
              value += d.bonuses + d.fines
            })

          return value
        },
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
    ]
  }, [selectedLocations])

  const columns = useMemo(() => {
    return initialColumns.filter(
      c => !hiddenColumns?.includes(c.accessorKey || c.key || ''),
    )
  }, [hiddenColumns, initialColumns])

  useEffect(() => {
    const startString = dateRange?.start.toString()
    const endString = dateRange?.end.toString()

    if (!(startString && endString)) {
      return
    }

    fetch('/api/getSalary', {
      method: 'POST',
      body: JSON.stringify({startString, endString}),
    }).then(async res => {
      if (res.ok) {
        const data = await res.json()
        const newData: any = []

        if (data.data) {
          const grouped: object = groupBy(data.data, 'name')
          Object.entries(grouped).forEach(([key, value]) => {
            const newUser: {
              user: {name: string; rank: string}
              salary: number
              balance: number
              bonuses: number
              fines: number
              together: number
              overwork: number
              bonusesfines: number
              name: string
              rank: string
              locations: string[]
              salaryData: {
                location: string
                salary: number
                overwork: number
                bonuses: number
                fines: number
              }[]
            } = {
              user: {name: '', rank: ''},
              salary: 0,
              balance: 0,
              bonuses: 0,
              fines: 0,
              together: 0,
              overwork: 0,
              bonusesfines: 0,
              name: '',
              rank: '',
              locations: [],
              salaryData: [],
            }

            newUser.name = key
            newUser.rank = value[0].rank
            newUser.user = {
              name: `${key} - ${value[0].first_name}`,
              rank: value[0].rank,
            }
            newUser.balance = value[0].balance || 0

            value.forEach((value: any) => {
              // @ts-ignore
              if (!newUser.locations.includes(value.location_name)) {
                // @ts-ignore
                newUser.locations.push(value.location_name)
              }

              const salary = value.value || 0
              let overwork = value.overwork || 0

              const dataIndex = newUser.salaryData.findIndex(
                d => d.location === value.location_name,
              )

              overwork +=
                (value.one_games?.value || 0) +
                (value.two_games?.value || 0) +
                (value.three_games?.value || 0) +
                (value.actor_games?.value || 0)

              let bonusesValue = 0
              let fines = 0

              if (bonuses) {
                if (
                  value.bonuses.endsWith('+') ||
                  value.bonuses.endsWith('-')
                ) {
                  value.bonuses = value.bonuses.slice(0, -1)
                }

                if (value.bonuses.startsWith('=')) {
                  value.bonuses = value.bonuses.slice(1)
                }

                bonusesValue = evaluate(value.bonuses || '0')
                fines = evaluate(value.fines || '0')
              }

              if (dataIndex === -1) {
                newUser.salaryData.push({
                  location: value.location_name,
                  salary,
                  overwork,
                  bonuses: bonusesValue,
                  fines,
                })
              } else {
                newUser.salaryData[dataIndex].salary += salary
                newUser.salaryData[dataIndex].overwork += overwork
                newUser.salaryData[dataIndex].bonuses += bonusesValue
                newUser.salaryData[dataIndex].fines += fines
              }

              newUser.salary += salary
              newUser.overwork += overwork
              newUser.bonuses += bonusesValue
              newUser.fines += fines
            })

            newUser.together = newUser.salary + newUser.overwork

            newUser.bonusesfines = newUser.bonuses + newUser.fines

            newData.push(newUser)
          })

          const sortedData = salarySort(newData)

          // @ts-ignore
          setData(sortedData)
          // @ts-ignore
          setInitialData(sortedData)
        }
      }
    })
  }, [bonuses, dateRange])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const allData = useMemo(() => {
    let allSalary = 0
    let bonuses = 0
    let summary = 0
    let fines = 0

    data.forEach((value: any) => {
      // @ts-ignore
      const obj = value.salaryData.filter(d =>
        selectedLocations.includes(d.location),
      )
      obj.forEach((value: any) => {
        allSalary += value.salary + value.overwork
        bonuses += value.bonuses
        fines += value.fines
        summary += value.salary + value.overwork + value.bonuses + value.fines
      })
    })

    return {salary: allSalary, bonuses, summary, fines}
  }, [data, selectedLocations])

  const ranksToHide = useMemo(() => ['Деревянный'], [])

  const filteredRanks = useMemo(() => {
    const newRanks = ranks.filter(r => !ranksToHide.includes(r.name))

    return newRanks.sort(
      (r1, r2) => r2.weight - r1.weight || r1.name.localeCompare(r2.name),
    )
  }, [ranks, ranksToHide])

  useEffect(() => {
    setData(
      initialData.filter(
        d =>
          // @ts-ignore
          selectedRanks.includes(d.rank) &&
          // @ts-ignore
          selectedLocations.some(sd => d.locations.includes(sd)),
      ),
    )
  }, [initialData, selectedLocations, selectedRanks])

  const download = useCallback(
    async (type: string) => {
      const response = await fetch('/api/excel', {
        method: 'POST',
        body: JSON.stringify({
          start_date: dateRange?.start.toString(),
          end_date: dateRange?.end.toString(),
          type,
        }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const interval = Interval.fromISO(
        `${dateRange?.start.toString()}/${dateRange?.end.toString()}`,
      )

      let name = 'Сводная'
      if (type === 'day') {
        name += ` по дням (${interval.toFormat('dd.MM.yyyy')})`
      } else if (type === 'month') {
        name += ' по месяцам'
      } else if (type === 'workers') {
        name += ` по сотрудникам (${interval.toFormat('dd.MM.yyyy')})`
      }
      a.download = `${name}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    },
    [dateRange?.end, dateRange?.start],
  )

  return (
    <div className="flex w-full gap-4">
      <div className="bg-content1 rounded-large relative w-full flex-1 pt-4">
        <table className="h-auto w-full table-fixed">
          <thead
            className="[&>tr]:first:shadow-small sticky z-1000 w-full"
            style={{
              top: `${isMobile ? `${headerSizes.height || 0}px` : 0}`,
            }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="rounded-2xl">
                {headerGroup.headers.map((header, index) => (
                  <Fragment key={header.id}>
                    <th
                      key={header.id}
                      className={`bg-default-100 test-start h-8 w-full min-w-20 px-2 py-3 align-middle text-xs font-medium tracking-wider uppercase first:rounded-s-lg last:rounded-e-lg ${header.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100' : ''}`}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                    {index !== headerGroup.headers.length - 1 && (
                      <th className="bg-default-100 w-px py-2">
                        <Divider
                          className="mx-auto h-8"
                          orientation="vertical"
                        />
                      </th>
                    )}
                  </Fragment>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <tr className="h-4"></tr>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <Fragment key={row.id}>
                <tr
                  onClick={() => setSelectedRow(row.id)}
                  className={`${selectedRow === row.id ? 'bg-default-300' : ''} transition-background`}>
                  {row.getVisibleCells().map((cell, index) => (
                    <Fragment key={cell.id}>
                      <td
                        id={`sum${cell.id}`}
                        className={`mx-auto ${index === 0 && rowIndex === 0 && 'rounded-t-2xl'} text-medium min-w-20 p-2 text-center ${index === 1 ? 'rounded-br-2xl' : ''} ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                      <td className="py-2">
                        <Divider
                          className="mx-auto h-8"
                          orientation="vertical"
                          hidden={index === row.getVisibleCells().length - 1}
                        />
                      </td>
                    </Fragment>
                  ))}
                </tr>
                <tr>
                  {[
                    ...row.getVisibleCells(),
                    ...new Array(row.getVisibleCells().length).fill(
                      row.getVisibleCells()[row.getVisibleCells().length - 1],
                    ),
                  ].map((cell, index) => (
                    <td
                      key={index}
                      className={`min-w-px px-1 ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}>
                      <Divider
                        className="mx-auto"
                        hidden={
                          rowIndex === table.getRowModel().rows.length - 1
                        }
                      />
                    </td>
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="sticky z-1000 flex h-fit w-[20%] flex-col gap-2"
        style={{
          top: `${isMobile ? `${headerSizes.height || 0}px` : 0}`,
        }}>
        <div className="glass flex flex-col gap-2 p-2">
          <DateRangePicker
            className="w-full"
            variant="bordered"
            onChange={val => setDateRange(val)}
          />
          <Checkbox checked={bonuses} onValueChange={setBonuses}>
            Бонусы
          </Checkbox>
          <Divider />
          <Select
            label="Ранг"
            className="w-full"
            variant="bordered"
            selectedKeys={selectedRanks}
            selectionMode="multiple"
            onSelectionChange={keys => {
              let newKeys = Array.from(keys)

              const removeAll =
                !newKeys.includes('all') && selectedRanks.includes('all')

              if (
                newKeys.length === filteredRanks.length &&
                !newKeys.includes('all') &&
                !removeAll
              ) {
                newKeys.push('all')
              }

              if (newKeys.includes('all')) {
                if (!selectedRanks.includes('all')) {
                  newKeys = ['all', ...filteredRanks.map(r => r.name)]
                }
              }

              if (removeAll) {
                newKeys = []
              }

              // @ts-ignore
              setSelectedRanks(newKeys)
            }}>
            <SelectItem
              key="all"
              classNames={{title: 'flex items-center gap-2'}}
              className="flex">
              Все
            </SelectItem>
            <>
              {filteredRanks.map(rank => (
                <SelectItem
                  key={rank.name}
                  classNames={{title: 'flex items-center gap-2'}}
                  className="flex">
                  {rank.name}
                </SelectItem>
              ))}
            </>
          </Select>
          <Select
            label="Локация"
            className="w-full"
            variant="bordered"
            selectedKeys={selectedLocations}
            selectionMode="multiple"
            onSelectionChange={keys => {
              let newKeys = Array.from(keys)

              const removeAll =
                !newKeys.includes('all') && selectedLocations.includes('all')

              if (
                newKeys.length === locations.length &&
                !newKeys.includes('all') &&
                !removeAll
              ) {
                newKeys.push('all')
              }

              if (newKeys.includes('all')) {
                if (!selectedLocations.includes('all')) {
                  newKeys = ['all', ...locations.map(r => r.name)]
                }
              }

              if (removeAll) {
                newKeys = []
              }

              // @ts-ignore
              setSelectedLocations(newKeys)
            }}>
            <SelectItem
              key="all"
              classNames={{title: 'flex items-center gap-2'}}
              className="flex">
              Все
            </SelectItem>
            <>
              {locations
                .sort((l1, l2) => l1.name.localeCompare(l2.name))
                .map(location => (
                  <SelectItem
                    key={location.name}
                    classNames={{title: 'flex items-center gap-2'}}
                    className="flex">
                    {location.name}
                  </SelectItem>
                ))}
            </>
          </Select>
        </div>
        <div className="glass flex flex-col gap-2 p-2">
          <Select
            label="Скрыть колонки"
            className="w-full"
            variant="bordered"
            selectionMode="multiple"
            selectedKeys={hiddenColumns}
            onSelectionChange={keys => {
              // @ts-ignore
              const array = Array.from(keys) as string[]
              setHiddenColumns(array)
              localStorage.setItem('hiddenColumns', array.toString())
            }}>
            {initialColumns.map(col => (
              <SelectItem
                key={col.accessorKey}
                classNames={{title: 'flex items-center gap-2'}}
                className="flex uppercase">
                {col.header}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="glass flex w-full flex-col items-center gap-2 p-2">
          <div className="glass flex w-full items-center gap-2 p-4">
            <span>ЗП + Переработка: </span>
            <Code color="success">
              {allData.salary.toLocaleString('fr-FR').replace(/,/g, ' ')}
            </Code>
          </div>
          <div className="glass flex w-full items-center gap-2 p-2">
            <span>Бонусы: </span>
            <Code color="success">
              {allData.bonuses.toLocaleString('fr-FR').replace(/,/g, ' ')}
            </Code>
          </div>
          <div className="glass flex w-full items-center gap-2 p-2">
            <span>Штрафы: </span>
            <Code color="success">
              {allData.fines.toLocaleString('fr-FR').replace(/,/g, ' ')}
            </Code>
          </div>
          <div className="glass flex w-full items-center gap-2 p-2">
            <span>Общее: </span>
            <Code color="success">
              {allData.summary.toLocaleString('fr-FR').replace(/,/g, ' ')}
            </Code>
          </div>
          <Button
            className="w-full"
            startContent={<Excel width={40} height={40} />}
            onPress={() => download('day')}>
            Скачать по дням
          </Button>
          <Button
            className="w-full"
            startContent={<Excel width={40} height={40} />}
            onPress={() => download('month')}>
            Скачать по месяцам
          </Button>
          <Button
            className="w-full"
            startContent={<Excel width={40} height={40} />}
            onPress={() => download('workers')}>
            Скачать по сотрудникам
          </Button>
        </div>
      </div>
    </div>
  )
}
