'use client'

import {
  getCoreRowModel,
  getFilteredRowModel,
  Header,
  useReactTable,
} from '@tanstack/react-table'
import {Dispatch, SetStateAction, useCallback} from 'react'
import TableHeader from '@/src/components/global/table/TableHeader'
import TableRow from '@/src/components/global/table/TableRow'
import {useAuth} from '@/src/components/global/providers/authProvider'
import useIsMobile from '@/src/hooks/useIsMobile'

interface TableProps {
  data: any
  columns: any[]
  headerClassNameAction?: (header: Header<any, any>) => string
  headerOffset?: number
  ignoreHeader?: boolean
  columnFilters?: any[]
  setColumnFiltersAction?: Dispatch<SetStateAction<never[]>>
}

export default function Table({
  data,
  columns,
  headerClassNameAction = () => '',
  headerOffset = 0,
  ignoreHeader = false,
  columnFilters = [],
  setColumnFiltersAction = () => [],
}: TableProps) {
  const isMobile = useIsMobile()
  const {headerRef} = useAuth()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnFilters,
    },
    // @ts-ignore
    onColumnFiltersChange: setColumnFiltersAction,
    getFilteredRowModel: getFilteredRowModel(),
  })

  const getFixedColumnLeftPosition = useCallback(
    (fixedIndex: number = 0) => {
      let leftOffset = 0
      const columns = table.getAllColumns()
      for (let i = 0; i < fixedIndex; i++) {
        leftOffset += columns[i].getSize()
      }

      return (
        leftOffset +
        (isMobile || ignoreHeader ? 0 : headerRef.current?.offsetWidth || 0)
      )
    },
    [table, isMobile, ignoreHeader, headerRef],
  )

  return (
    <div className="bg-content1 rounded-large relative w-full pt-4">
      <table className="h-full w-full max-w-full">
        <thead
          className="[&>tr]:first:shadow-small sticky z-1000"
          style={{
            top: `${headerOffset || 2}px`,
          }}>
          {table.getHeaderGroups().map(headerGroup => (
            <TableHeader
              key={headerGroup.id}
              headerGroup={headerGroup}
              getFixedColumnLeftPosition={getFixedColumnLeftPosition}
              getHeaderClassNames={headerClassNameAction}
            />
          ))}
        </thead>
        <tbody className="after:block">
          <tr className="h-4"></tr>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <TableRow
              key={row.id}
              row={row}
              rowIndex={rowIndex}
              getFixedColumnLeftPosition={getFixedColumnLeftPosition}
              dataLength={table.getRowModel().rows.length}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
