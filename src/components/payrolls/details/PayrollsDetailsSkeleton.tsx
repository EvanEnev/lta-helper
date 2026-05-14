import {Skeleton} from '@heroui/react'

const NUMBER = 20
export default async function PayrollsDetailsSkeleton() {
  return (
    <main className="flex h-full w-full flex-col gap-2 p-4">
      <Skeleton className="sticky top-2 z-1000 h-14 w-full rounded-2xl" />
      {Array.from({length: NUMBER}).map((_, i) => (
        <Skeleton key={i} className="h-45 w-full rounded-2xl" />
      ))}
    </main>
  )
}
