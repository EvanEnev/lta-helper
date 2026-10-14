import {DateTime} from 'luxon'
import {Badge} from '@/components/ui/badge'
import {cn} from '@/lib/utils'
import type {InternshipResult} from './types'

export const formatDate = (date: string) =>
  DateTime.fromISO(date).setLocale('ru').toFormat('d MMMM, EEE')

export const initials = (name: string) => name.slice(0, 2).toUpperCase()

export function ResultBadge({result}: {result: InternshipResult | null}) {
  if (result === 'passed') {
    return <Badge className="bg-success/15 text-success">Прошёл</Badge>
  }

  if (result === 'failed') {
    return <Badge variant="destructive">Не прошёл</Badge>
  }

  return <Badge className="bg-warning/15 text-warning">В процессе</Badge>
}

interface DaysDotsProps {
  done: number
  planned: number
  className?: string
}

export function DaysDots({done, planned, className}: DaysDotsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {Array.from({length: Math.max(planned, done)}, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-2 min-w-6 flex-1 rounded-full',
            index < done ? 'bg-primary' : 'bg-muted',
          )}
        />
      ))}
    </div>
  )
}
