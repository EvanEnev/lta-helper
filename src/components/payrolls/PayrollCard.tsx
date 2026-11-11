'use client'

import {useState} from 'react'
import Link from 'next/link'
import {DateTime, Interval} from 'luxon'
import {CircleCheck, CircleX, Trash2} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import checkPermissions from '@/lib/functions/checkPermissions'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {cn} from '@/lib/utils'
import type {LTPayroll, LTWorker} from '@/src/utils/types'

interface PayrollCardProps {
  data: LTPayroll
  onDelete: (payrollId: LTPayroll['id']) => void
  worker: LTWorker
}

export default function PayrollCard({
  data,
  onDelete,
  worker,
}: PayrollCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setDeleting] = useState(false)

  const interval = Interval.fromISO(data.dates)
  const createdAt = DateTime.fromISO(data.createdAt)
  const takeBy = DateTime.fromISO(data.takeBy)
  const today = DateTime.now().startOf('day')

  const canViewAllData = checkPermissions(
    ['view_all_payrolls', 'edit_payrolls'],
    worker,
  )
  const canEdit = checkPermissions(['edit_payrolls'], worker)
  const isOpen = takeBy >= today

  const remove = async () => {
    setDeleting(true)

    try {
      const res = await fetchHandler({
        url: '/api/payrolls/delete',
        method: 'POST',
        body: {payroll_id: data.id},
      })

      if (res) onDelete(data.id)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const href = data.isPublished
    ? {pathname: `/payrolls/${data.id}`}
    : {
        pathname: '/payrolls/create',
        query: {
          dates: JSON.stringify({
            start: data.meta?.dates?.start?.toString(),
            end: data.meta?.dates?.end?.toString(),
          }),
          moneyOnLocations: JSON.stringify([]),
          bonuses: data.meta?.withBonuses,
          workersBonusesRange: JSON.stringify({
            start: data.meta?.workersBonusesRange?.start?.toString(),
            end: data.meta?.workersBonusesRange?.end?.toString(),
          }),
          actorsBonusesRange: JSON.stringify({
            start: data.meta?.dates?.start?.toString(),
            end: data.meta?.dates?.end?.toString(),
          }),
        },
      }

  return (
    <Card className={cn(!isOpen && 'opacity-80')}>
      <CardHeader>
        <CardTitle className="text-lg">
          {interval.toFormat('dd.MM.yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 text-sm">
        {canViewAllData && (
          <>
            {!data.isPublished && (
              <Badge variant="destructive" className="w-fit">
                Не опубликована
              </Badge>
            )}
            <p className="text-muted-foreground">
              Создана: {createdAt.toFormat('dd.MM.yyyy HH:mm')},{' '}
              {data.createdBy?.name}
            </p>
            <p className="text-muted-foreground">
              Сотрудников: {data.workersCount}
            </p>
          </>
        )}
        <p>
          Можно забрать до:{' '}
          <span
            className={cn(
              'font-medium',
              isOpen ? 'text-success' : 'text-destructive',
            )}>
            {takeBy.toFormat('dd.MM.yyyy')}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          Бонусы:{' '}
          {data.bonuses ? (
            <CircleCheck className="text-success size-4" />
          ) : (
            <CircleX className="text-destructive size-4" />
          )}
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          nativeButton={false}
          onClick={() => {
            if (!data.isPublished) {
              try {
                localStorage.setItem(
                  'payrollsCreate',
                  JSON.stringify(data.meta),
                )
              } catch {}
            }
          }}
          render={<Link href={href} />}>
          Подробнее
        </Button>
        {canEdit && (
          <Button
            variant="destructive"
            size="icon"
            aria-label="Удалить ведомость"
            onClick={() => setConfirmDelete(true)}>
            <Trash2 />
          </Button>
        )}
      </CardFooter>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить ведомость?</DialogTitle>
            <DialogDescription>
              Ведомость за {interval.toFormat('dd.MM.yyyy')} будет удалена
              вместе со всеми её данными. Действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Нет
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={remove}>
              Да, удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
