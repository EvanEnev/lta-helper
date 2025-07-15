'use client'

import {
  Column,
  flexRender,
  getCoreRowModel,
  Header,
  useReactTable,
} from '@tanstack/react-table'
import {Fragment, useCallback} from 'react'
import {Divider} from '@heroui/react'
import TableRow from '@/src/components/global/table/TableRow'

interface TableProps {
  data: any
  columns: any[]
  headerClassNameAction?: (header: Header<any, any>) => string
}

export default function Table({
  data,
  columns,
  headerClassNameAction = () => '',
}: TableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const getFixedColumnLeftPosition = useCallback(
    (fixedIndex: number = 0) => {
      let leftOffset = 0
      const columns = table.getAllColumns()
      for (let i = 0; i < fixedIndex; i++) {
        leftOffset += columns[i].getSize()
      }

      return leftOffset
    },
    [table],
  )

  return (
    <div className="bg-content1 rounded-large relative w-full pt-4">
      <table className="h-auto w-full max-w-full">
        <thead
          className="[&>tr]:first:shadow-small sticky z-1000"
          style={{
            top: `${document.querySelector('header')?.offsetHeight}px`,
          }}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="rounded-2xl">
              {headerGroup.headers.map((header, index) => {
                return (
                  <Fragment key={header.id}>
                    <th
                      key={header.id}
                      className={`h-[2rem] w-[5rem] min-w-[5rem] px-2 py-3 align-middle text-xs font-medium tracking-wider first:rounded-s-lg last:rounded-e-lg ${header.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100' : ''} ${headerClassNameAction(header)}`}
                      style={{
                        width: `${header.getSize()}px`,
                        minWidth: `${header.getSize()}px`,
                        ...(header.column.columnDef.meta?.frozen && {
                          left: `${getFixedColumnLeftPosition(
                            header.column.columnDef.meta?.fixedPosition,
                          )}px`,
                        }),
                      }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                    <th className="bg-default-100 w-px py-2">
                      <Divider
                        className="mx-auto h-[2rem]"
                        orientation="vertical"
                        hidden={index === headerGroup.headers.length - 1}
                      />
                    </th>
                  </Fragment>
                )
              })}
            </tr>
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
              dataLength={data.length}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
