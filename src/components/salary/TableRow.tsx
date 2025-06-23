import {Fragment, useRef} from 'react'
import {flexRender, Row} from '@tanstack/react-table'
import {Divider} from '@heroui/react'

interface TableRowProps {
  row: Row<any>
  getFixedColumnLeftPosition(fixedIndex?: number): number
  rowIndex: number
  dataLength: number
  canEdit: boolean
}

export default function TableRow({
  row,
  getFixedColumnLeftPosition,
  rowIndex,
  dataLength,
  canEdit,
}: TableRowProps) {
  const rowRef = useRef<HTMLTableRowElement | null>(null)

  return (
    <Fragment>
      <tr className={`${canEdit ? 'h-[3rem]' : 'h-[10rem]'}`} ref={rowRef}>
        {row.getVisibleCells().map((cell, index) => (
          <Fragment key={cell.id}>
            <td
              id={cell.id}
              className={`${index === 0 && rowIndex === 0 && 'rounded-t-2xl'} h-full w-[5rem] min-w-[5rem] p-2 text-center text-sm sm:w-[10rem] sm:min-w-[10rem] ${index === 1 ? 'rounded-br-2xl' : ''} ${!cell.column.columnDef.meta?.frozen ? '' : ''} ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}
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
                className="mx-auto min-h-[5rem]"
                orientation="vertical"
                hidden={
                  (dataLength > 1 && index === 0) ||
                  index === row.getVisibleCells().length - 1
                }
                style={{
                  height: `${rowRef.current?.offsetHeight || 0}px`,
                }}
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
            className={`min-w-px px-1 ${cell.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100 shadow-sm' : ''}`}
            style={{
              ...(cell.column.columnDef.meta?.frozen && {
                left: `${getFixedColumnLeftPosition(
                  cell.column.columnDef.meta?.fixedPosition,
                )}px`,
              }),
            }}>
            <Divider className="mx-auto" hidden={rowIndex === dataLength - 1} />
          </td>
        ))}
      </tr>
    </Fragment>
  )
}
