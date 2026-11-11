'use client'

import {useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {DateTime} from 'luxon'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CircleCheck,
  CircleX,
  Lock,
  Minus,
  Plus,
  Repeat,
  Save,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from 'lucide-react'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import DatePopover from '@/src/components/global/DatePopover'
import fetchHandler from '@/src/utils/global/fetchHandler'
import type {Curator} from '@/lib/internship/curators'
import {cn} from '@/lib/utils'
import {DaysDots, ResultBadge, formatDate, initials} from './shared'
import type {InternshipDay, InternshipDetails} from './types'

interface InternshipDetailPageProps {
  internship: InternshipDetails
  userId: number
  canTransfer: boolean
  curators: Curator[]
}

const today = () =>
  DateTime.now().setZone('Europe/Moscow').toFormat('yyyy-MM-dd')

const FIELDS = [
  {
    key: 'strengths',
    name: 'Сильные стороны',
    icon: ThumbsUp,
    tone: 'text-success bg-success/10',
  },
  {
    key: 'weaknesses',
    name: 'Слабые стороны',
    icon: ThumbsDown,
    tone: 'text-destructive bg-destructive/10',
  },
  {
    key: 'toLearn',
    name: 'Что подучить',
    icon: BookOpen,
    tone: 'text-warning bg-warning/10',
  },
] as const

interface DayFormProps {
  internshipId: number
  day?: InternshipDay
  date: string
  onSaved: () => void
}

function DayForm({internshipId, day, date, onSaved}: DayFormProps) {
  const [pending, setPending] = useState(false)

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async event => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)

        setPending(true)
        const result = await fetchHandler({
          url: '/api/internship/day',
          body: {
            internshipId,
            date,
            strengths: data.get('strengths'),
            weaknesses: data.get('weaknesses'),
            toLearn: data.get('toLearn'),
          },
        })
        setPending(false)

        if (result) onSaved()
      }}>
      {FIELDS.map(field => (
        <label key={field.key} className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-md',
                field.tone,
              )}>
              <field.icon className="size-3.5" />
            </span>
            {field.name}
          </span>
          <Textarea
            name={field.key}
            maxLength={2000}
            defaultValue={day?.[field.key]}
          />
        </label>
      ))}
      <Button type="submit" disabled={pending} className="self-start">
        <Save />
        Сохранить
      </Button>
    </form>
  )
}

export default function InternshipDetailPage({
  internship,
  userId,
  canTransfer,
  curators,
}: InternshipDetailPageProps) {
  const router = useRouter()
  const isClosed = !!internship.closedAt
  const isOwner = internship.curatorId === userId
  const canEdit = isOwner && !isClosed

  const [date, setDate] = useState(today())
  const [plannedDays, setPlannedDays] = useState(internship.plannedDays)
  const [summary, setSummary] = useState('')
  const [pending, setPending] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [newCurator, setNewCurator] = useState('')

  const current = internship.days.find(d => d.date === date)
  const refresh = () => router.refresh()
  const options = curators.filter(c => c.id !== internship.curatorId)

  const savePlan = async (value: number) => {
    if (value === plannedDays || value < 1 || value > 60) return

    const previous = plannedDays

    setPlannedDays(value)
    setPending(true)

    const result = await fetchHandler({
      url: '/api/internship/plan',
      body: {internshipId: internship.id, plannedDays: value},
      showNotification: false,
    })

    setPending(false)

    if (result) refresh()
    else setPlannedDays(previous)
  }

  const close = async (value: 'passed' | 'failed') => {
    setPending(true)
    const result = await fetchHandler({
      url: '/api/internship/close',
      body: {internshipId: internship.id, result: value, summary},
    })
    setPending(false)

    if (result) refresh()
  }

  const transfer = async () => {
    setPending(true)
    const result = await fetchHandler({
      url: '/api/internship/transfer',
      body: {internshipId: internship.id, curatorId: Number(newCurator)},
    })
    setPending(false)

    if (result) {
      setTransferOpen(false)
      refresh()
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        render={<Link href="/internship" />}
        nativeButton={false}>
        <ArrowLeft />
        Все стажёры
      </Button>

      <Card className="from-primary/10 bg-linear-to-br to-transparent">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="size-14">
              <AvatarFallback className="text-lg">
                {initials(internship.workerName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">
                {internship.workerName}
              </h1>
              <div className="mt-1">
                <ResultBadge result={internship.result} />
              </div>
            </div>
            {canTransfer && !isClosed && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setTransferOpen(true)}>
                <Repeat />
                Передать
              </Button>
            )}
          </div>

          <DaysDots
            done={internship.days.length}
            planned={internship.plannedDays}
          />

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              День {internship.days.length} из {internship.plannedDays}
            </span>
            <span className="flex items-center gap-1.5">
              <UserRound className="size-4" />
              {isOwner ? 'Вы ведёте' : `Куратор ${internship.curator}`}
            </span>
            <span>Начало {formatDate(internship.startedAt)}</span>
          </div>

          {canEdit && (
            <div className="flex items-center gap-3">
              <span className="text-sm">Всего дней</span>
              <div className="bg-background/60 flex items-center rounded-full border p-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  aria-label="Меньше дней"
                  disabled={
                    pending ||
                    plannedDays <= Math.max(1, internship.days.length)
                  }
                  onClick={() => savePlan(plannedDays - 1)}>
                  <Minus />
                </Button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">
                  {plannedDays}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  aria-label="Больше дней"
                  disabled={pending || plannedDays >= 60}
                  onClick={() => savePlan(plannedDays + 1)}>
                  <Plus />
                </Button>
              </div>
            </div>
          )}

          {isClosed && internship.summary && (
            <p className="bg-background/60 rounded-lg p-3 text-sm whitespace-pre-wrap">
              {internship.summary}
            </p>
          )}
        </CardContent>
      </Card>

      {!isClosed && !isOwner && (
        <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-xl p-3 text-sm">
          <Lock className="size-4 shrink-0" />
          Стажировку ведёт {internship.curator}, вы можете только смотреть
        </div>
      )}

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Фидбэк за день</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DatePopover
              value={date}
              label="Дата фидбэка"
              min={internship.startedAt}
              max={today()}
              className="w-44 justify-start gap-2 font-normal"
              onChange={setDate}
            />
            <DayForm
              key={`${date}-${current?.id ?? 'new'}-${current?.strengths}-${current?.weaknesses}-${current?.toLearn}`}
              internshipId={internship.id}
              day={current}
              date={date}
              onSaved={refresh}
            />
          </CardContent>
        </Card>
      )}

      {!!internship.days.length && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">История</h2>
          <div className="border-border relative ml-3 flex flex-col gap-4 border-l pl-5">
            {[...internship.days].reverse().map((day, index, list) => (
              <div key={day.id} className="relative">
                <span className="bg-primary text-primary-foreground absolute top-0 -left-8.5 flex size-7 items-center justify-center rounded-full text-xs font-semibold">
                  {list.length - index}
                </span>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      {formatDate(day.date)}
                      <span className="text-muted-foreground text-xs font-normal">
                        {day.createdBy}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {FIELDS.map(
                      field =>
                        day[field.key] && (
                          <div
                            key={field.key}
                            className={cn(
                              'flex gap-2 rounded-lg p-2.5',
                              field.tone.split(' ')[1],
                            )}>
                            <field.icon
                              className={cn(
                                'mt-0.5 size-4 shrink-0',
                                field.tone.split(' ')[0],
                              )}
                            />
                            <div className="min-w-0 text-sm">
                              <p className="text-muted-foreground text-xs">
                                {field.name}
                              </p>
                              <p className="whitespace-pre-wrap">
                                {day[field.key]}
                              </p>
                            </div>
                          </div>
                        ),
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Закрыть стажировку</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Textarea
              placeholder="Итог стажировки"
              maxLength={4000}
              value={summary}
              onChange={event => setSummary(event.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              При «Прошёл» стажёр автоматически получит следующий ранг
            </p>
            <div className="flex flex-wrap gap-2">
              <Button disabled={pending} onClick={() => close('passed')}>
                <CircleCheck />
                Прошёл
              </Button>
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() => close('failed')}>
                <CircleX />
                Не прошёл
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Передать стажировку</DialogTitle>
            <DialogDescription>
              Новый куратор сможет вести фидбэк и закрыть стажёра
            </DialogDescription>
          </DialogHeader>
          <Select
            value={newCurator}
            onValueChange={value => setNewCurator(value ?? '')}
            items={options.map(c => ({value: String(c.id), label: c.name}))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите куратора" />
            </SelectTrigger>
            <SelectContent>
              {options.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>
              Отмена
            </Button>
            <Button disabled={!newCurator || pending} onClick={transfer}>
              Передать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
