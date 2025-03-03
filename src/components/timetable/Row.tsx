import {ReactNode} from 'react'
import Cell from './Cell'
import {Divider} from '@nextui-org/react'

export default function Row({
  children,
  rowNumber,
  className = '',
}: {
  children: ReactNode[]
  rowNumber: number
  className?: string
}) {
  console.log(children)
  return children?.map((child, index) => {
    return (
      <>
        <div
          key={index}
          className={`col-start-${index * 2 + 1} row-start-${rowNumber} max-10 h-10 w-full text-center ${className}`}>
          {child}
        </div>
        <Divider
          orientation="vertical"
          className={`col-start-${index * 2 + 2} row-start-${rowNumber} max-10 h-10 ${className}`}
        />
      </>
    )
  })
}
