import {Fragment} from 'react'
import {Cell, flexRender, Row} from '@tanstack/react-table'
import {Divider} from '@heroui/react'

interface TableRowProps {
  row: Row<any>
  getFixedColumnLeftPosition(fixedIndex?: number): number
  rowIndex: number
  dataLength: number
}

export default function TableRow({
  row,
  getFixedColumnLeftPosition,
  rowIndex,
  dataLength,
}: TableRowProps) {
  const getRoundClassNames = (cell: Cell<any, any>) => {
    let className = ''

    if (cell.column.columnDef.meta?.frozen) {
      if (dataLength === 1) {
        className = 'rounded-2xl'
      } else if (rowIndex === 0) {
        className = 'rounded-t-2xl'
      } else if (rowIndex === dataLength - 1) {
        className = 'rounded-b-2xl'
      }
    }

    return className
  }
  return (
    <Fragment>
      <tr className="max-h-fit min-h-6" key={row.id}>
        {row.getVisibleCells().map((cell, index) => {
          return (
            <Fragment key={cell.id}>
              <td
                id={cell.id}
                className={`${getRoundClassNames(cell)} h-full min-w-[5rem] p-2 text-center text-sm sm:min-w-[10rem] ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}
                style={{
                  ...(cell.column.columnDef.meta?.frozen && {
                    left: `${getFixedColumnLeftPosition(
                      cell.column.columnDef.meta?.fixedPosition,
                    )}px`,
                  }),
                }}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
              <td className="h-full py-2">
                <Divider
                  className="mx-auto h-full min-h-[5rem]"
                  orientation="vertical"
                  hidden={
                    (dataLength > 1 && cell.column.columnDef.meta?.frozen) ||
                    index === row.getAllCells().length - 1
                  }
                />
              </td>
            </Fragment>
          )
        })}
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
            className={`min-w-px px-1 ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}
            style={{
              ...(cell.column.columnDef.meta?.frozen && {
                left: `${getFixedColumnLeftPosition(
                  cell.column.columnDef.meta?.fixedPosition,
                )}px`,
              }),
            }}>
            <Divider className="mx-auto" hidden={index % 2 !== 0} />
          </td>
        ))}
      </tr>
    </Fragment>
  )
}
