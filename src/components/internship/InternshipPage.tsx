'use client'

import {useState} from 'react'
import Link from 'next/link'
import {
  CircleCheck,
  CircleX,
  GraduationCap,
  Hourglass,
  UserRound,
} from 'lucide-react'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent} from '@/components/ui/card'
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs'
import StatTile from '@/src/components/global/StatTile'
import {cn} from '@/lib/utils'
import {DaysDots, ResultBadge, initials} from './shared'
import type {InternshipRow} from './types'

interface InternshipPageProps {
  rows: InternshipRow[]
  userId: number
}

type Scope = 'all' | 'mine'

export default function InternshipPage({rows, userId}: InternshipPageProps) {
  const [scope, setScope] = useState<Scope>('all')

  const visible = rows.filter(
    row => scope === 'all' || row.curatorId === userId,
  )
  const active = visible.filter(r => r.internshipId && !r.closedAt)
  const closed = visible.filter(r => r.closedAt)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      <div className="from-primary/10 via-primary/5 flex flex-col gap-4 rounded-2xl bg-gradient-to-br to-transparent p-5">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-xl">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <h1 className="text-xl leading-tight font-semibold">Стажировка</h1>
            <p className="text-muted-foreground text-sm">
              Фидбэк по дням и итог для каждого стажёра
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <StatTile
            icon={Hourglass}
            value={rows.filter(r => r.internshipId && !r.closedAt).length}
            label="Идут сейчас"
            className="text-warning"
          />
          <StatTile
            icon={CircleCheck}
            value={rows.filter(r => r.result === 'passed').length}
            label="Прошли"
            className="text-success"
          />
          <StatTile
            icon={CircleX}
            value={rows.filter(r => r.result === 'failed').length}
            label="Не прошли"
            className="text-destructive"
          />
        </div>
      </div>

      <Tabs value={scope} onValueChange={value => setScope(value as Scope)}>
        <TabsList>
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="mine">Мои</TabsTrigger>
        </TabsList>
      </Tabs>

      <Section title="Идёт стажировка" count={active.length}>
        {!active.length && <Empty text="Активных стажировок нет" />}
        <div className="grid gap-3 sm:grid-cols-2">
          {active.map(row => (
            <InternRow key={row.internshipId} row={row} userId={userId} />
          ))}
        </div>
      </Section>

      {!!closed.length && (
        <Section title="Завершённые" count={closed.length}>
          <div className="grid gap-3 sm:grid-cols-2">
            {closed.map(row => (
              <InternRow key={row.internshipId} row={row} userId={userId} />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-medium">
        {title}
        <Badge variant="secondary">{count}</Badge>
      </h2>
      {children}
    </section>
  )
}

function Empty({text}: {text: string}) {
  return (
    <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
      {text}
    </div>
  )
}

function InternRow({row, userId}: {row: InternshipRow; userId: number}) {
  const isMine = row.curatorId === userId
  const isClosed = !!row.closedAt

  return (
    <Link href={`/internship/${row.internshipId}`}>
      <Card
        size="sm"
        className={cn(
          'hover:bg-muted/40 h-full transition-colors',
          isMine && !isClosed && 'ring-primary/40 ring-2',
        )}>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>{initials(row.workerName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.workerName}</p>
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                <UserRound className="size-3" />
                {isMine ? 'Вы ведёте' : row.curator}
              </p>
            </div>
            <div className="ml-auto">
              <ResultBadge result={row.result} />
            </div>
          </div>
          <DaysDots done={row.daysCount} planned={row.plannedDays || 0} />
          <p className="text-muted-foreground text-xs">
            {isClosed
              ? `${row.daysCount} дн. стажировки`
              : `День ${row.daysCount} из ${row.plannedDays}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
