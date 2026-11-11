import {Skeleton} from '@/components/ui/skeleton'

export default function PayrollsDetailsSkeleton() {
  return (
    <main className="flex flex-col gap-2 p-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({length: 8}, (_, i) => (
        <Skeleton key={i} className="h-36 w-full" />
      ))}
    </main>
  )
}
