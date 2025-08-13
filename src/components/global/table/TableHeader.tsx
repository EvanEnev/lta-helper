import {Fragment} from 'react'
import {flexRender, Header, HeaderGroup} from '@tanstack/react-table'
import {Divider} from '@heroui/react'

interface TableRowProps {
  getFixedColumnLeftPosition(fixedIndex?: number): number
  headerGroup: HeaderGroup<any>
  getHeaderClassNames(header: Header<any, any>): string
}

export default function TableHeader({
  getFixedColumnLeftPosition,
  headerGroup,
  getHeaderClassNames,
}: TableRowProps) {
  return (
    <tr key={headerGroup.id} className="rounded-2xl">
      {headerGroup.headers.map((header, index) => {
        return (
          <Fragment key={header.id}>
            <th
              key={header.id}
              className={`bg-default-100 h-[2rem] min-w-[5rem] px-2 py-3 align-middle text-xs font-medium tracking-wider first:rounded-s-lg last:rounded-e-lg ${header.column.columnDef.meta?.frozen ? 'bg-content2 sticky z-100' : ''} ${getHeaderClassNames(header)}`}
              style={{
                width: `${header.getSize()}px`,
                minWidth: `${header.getSize()}px`,
                ...(header.column.columnDef.meta?.frozen && {
                  left: `${getFixedColumnLeftPosition(
                    header.column.columnDef.meta?.fixedPosition,
                  )}px`,
                }),
              }}>
              {flexRender(header.column.columnDef.header, header.getContext())}
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
  )
}
