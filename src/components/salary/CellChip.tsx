import {ReactNode} from 'react'

export default function CellChip({
  children,
  className = '',
}: {
  children: ReactNode | ReactNode[]
  className?: string
}) {
  return (
    <div
      className={`${className} bg-default-100 rounded-medium text-foreground relative inline-flex h-10 min-h-10 w-full items-center px-3 text-start`}>
      {children}
    </div>
  )
}
