'use client'

import {useId, useState, type ReactNode} from 'react'
import {Loader2} from 'lucide-react'
import {withMask} from 'use-mask-input'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {LTRank, LTWorkerData} from '@/src/utils/types'

interface ApproveDialogProps {
  worker: LTWorkerData | null
  ranks: LTRank[]
  onClose: () => void
  onSubmit: (data: FormData, workerId: number) => Promise<boolean>
}

function Field({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  )
}

export default function ApproveDialog({
  worker,
  ranks,
  onClose,
  onSubmit,
}: ApproveDialogProps) {
  const formId = useId()
  const [isPending, setPending] = useState(false)

  return (
    <Dialog open={!!worker} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        {worker && (
          <>
            <DialogHeader>
              <DialogTitle>Подтверждение сотрудника</DialogTitle>
              <DialogDescription>
                Проверьте данные и выберите ранг
              </DialogDescription>
            </DialogHeader>
            <form
              id={formId}
              key={worker.id}
              className="flex flex-col gap-3"
              onSubmit={async event => {
                event.preventDefault()
                const data = new FormData(event.currentTarget)

                setPending(true)
                const ok = await onSubmit(data, worker.id)
                setPending(false)

                if (ok) onClose()
              }}>
              <Field label="Позывной">
                <Input name="name" required defaultValue={worker.name} />
              </Field>
              <Field label="Фамилия">
                <Input
                  name="last_name"
                  required
                  defaultValue={worker.lastName ?? ''}
                />
              </Field>
              <Field label="Имя">
                <Input
                  name="first_name"
                  required
                  defaultValue={worker.firstName ?? ''}
                />
              </Field>
              <Field label="Отчество">
                <Input
                  name="middle_name"
                  defaultValue={worker.middleName ?? ''}
                />
              </Field>
              <Field label="Номер телефона">
                <Input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+7 ___ ___-__-__"
                  defaultValue={worker.phoneNumber ?? ''}
                  ref={withMask('+7 999 999-99-99', {
                    inputmode: 'numeric',
                    placeholder: '_',
                  })}
                />
              </Field>
              <Field label="Google почта">
                <Input
                  name="email"
                  type="email"
                  required
                  defaultValue={worker.email ?? ''}
                />
              </Field>
              <Field label="Ранг">
                <Select
                  name="rank_id"
                  required
                  defaultValue={String(worker.rank.id)}
                  items={ranks.map(rank => ({
                    value: String(rank.id),
                    label: rank.name,
                  }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map(rank => (
                      <SelectItem key={rank.id} value={String(rank.id)}>
                        {rank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Закрыть
              </Button>
              <Button type="submit" form={formId} disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Подтвердить
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
