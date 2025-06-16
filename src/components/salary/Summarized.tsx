import {Fragment, useCallback, useEffect, useMemo, useState} from 'react'
import {
  Checkbox,
  DateRangePicker,
  DateValue,
  Divider,
  RangeValue,
} from '@heroui/react'
import groupBy from '@/lib/functions/groupBy'
import {evaluate} from 'mathjs'
import {flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import CellChip from '@/src/components/salary/CellChip'

export default function Summarized() {
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(null)
  const [bonuses, setBonuses] = useState<boolean>(false)
  const [data, setData] = useState([])

  const render = useCallback((data: any) => {
    return <CellChip className="text-medium! h-fit p-2">{data}</CellChip>
  }, [])

  const columns = useMemo(() => {
    return [
      {
        header: 'Сотрудник',
        accessorKey: 'user',
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'ЗП',
        accessorKey: 'salary',
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'Бонусы',
        accessorKey: 'bonuses',
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'Штрафы',
        accessorKey: 'fines',
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
      {
        header: 'Суммарно',
        accessorKey: 'together',
        cell: ({getValue}: {getValue: () => any}) => render(getValue()),
      },
    ]
  }, [])

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
            const newUser = {
              user: '',
              salary: 0,
              bonuses: 0,
              fines: 0,
              together: 0,
            }

            newUser.user = `${key} - ${value[0].first_name}`
            value.forEach((value: any) => {
              newUser.salary += value.value
              if (bonuses) {
                newUser.bonuses += evaluate(value.bonuses || '0')
                newUser.fines += evaluate(value.fines || '0')
              }
            })

            newUser.together = newUser.salary + newUser.bonuses + newUser.fines

            newData.push(newUser)
          })

          const sortedData = newData.sort((a: any, b: any) =>
            a.user.localeCompare(b.user),
          )

          setData(sortedData)
        }
      }
    })
  }, [bonuses, dateRange])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex w-full gap-4">
      <div className="bg-content1 rounded-large relative w-full flex-1 pt-4">
        <table className="h-auto w-full table-fixed">
          <thead
            className="[&>tr]:first:shadow-small sticky z-1000 w-full"
            style={{
              top: `${document.querySelector('header')?.offsetHeight}px`,
            }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="rounded-2xl">
                {headerGroup.headers.map((header, index) => (
                  <>
                    <th
                      key={header.id}
                      className={`bg-default-100 test-start h-[2rem] w-full min-w-[5rem] px-2 py-3 align-middle text-xs font-medium tracking-wider uppercase first:rounded-s-lg last:rounded-e-lg ${header.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100' : ''}`}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                    {index !== headerGroup.headers.length - 1 && (
                      <th className="bg-default-100 w-px py-2">
                        <Divider
                          className="mx-auto h-[2rem]"
                          orientation="vertical"
                        />
                      </th>
                    )}
                  </>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <tr className="h-4"></tr>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <Fragment key={row.id}>
                <tr className="">
                  {row.getVisibleCells().map((cell, index) => (
                    <Fragment key={cell.id}>
                      <td
                        id={`sum${cell.id}`}
                        className={`mx-auto ${index === 0 && rowIndex === 0 && 'rounded-t-2xl'} text-medium min-w-[5rem] p-2 text-center ${index === 1 ? 'rounded-br-2xl' : ''} ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                      <td className="py-2">
                        <Divider
                          className="mx-auto h-[2rem]"
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
        className="sticky z-1000 flex flex-col gap-2"
        style={{
          top: `${document.querySelector('header')?.offsetHeight}px`,
        }}>
        <DateRangePicker
          className="max-w-fit"
          onChange={val => setDateRange(val)}
        />
        <Checkbox checked={bonuses} onValueChange={setBonuses}>
          Бонусы
        </Checkbox>
      </div>
    </div>
  )
}
