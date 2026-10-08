'use client'

import {useState, type FormEvent} from 'react'
import {Loader2} from 'lucide-react'
import {withMask} from 'use-mask-input'
import {Button} from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {Input} from '@/components/ui/input'
import type {LTWorker} from '@/src/utils/types'

interface Curator {
  id: number
  name: string
}

interface ProfileStepProps {
  worker?: Partial<LTWorker>
  curators: Curator[]
  email: string
  isPending: boolean
  onSubmit: (data: Record<string, string>) => void
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
    </div>
  )
}

const realEmail = (value?: string | null) =>
  value && /^[^@\s]+@[^@\s]+$/.test(value) ? value : undefined

const inputClass = 'h-11 text-base'

export default function ProfileStep({
  worker,
  curators,
  email,
  isPending,
  onSubmit,
}: ProfileStepProps) {
  const [curator, setCurator] = useState<Curator | null>(null)
  const [missingCurator, setMissingCurator] = useState(false)

  const handle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!curator) {
      setMissingCurator(true)
      return
    }

    const data = Object.fromEntries(new FormData(event.currentTarget))

    onSubmit({
      ...(data as Record<string, string>),
      invited_by: String(curator.id),
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handle}>
      <Field label="Позывной">
        <Input
          name="name"
          required
          autoComplete="nickname"
          defaultValue={worker?.name}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Фамилия">
          <Input
            name="last_name"
            required
            autoComplete="family-name"
            defaultValue={worker?.lastName || undefined}
            className={inputClass}
          />
        </Field>
        <Field label="Имя">
          <Input
            name="first_name"
            required
            autoComplete="given-name"
            defaultValue={worker?.firstName || undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Отчество">
        <Input
          name="middle_name"
          required
          autoComplete="additional-name"
          defaultValue={worker?.middleName || undefined}
          className={inputClass}
        />
      </Field>

      <Field label="Номер телефона">
        <Input
          name="phone"
          type="tel"
          required
          placeholder="+7 ___ ___-__-__"
          defaultValue={worker?.phoneNumber || undefined}
          ref={withMask('+7 999 999-99-99', {
            inputmode: 'numeric',
            placeholder: '_',
          })}
          className={inputClass}
        />
      </Field>

      <Field
        label="Google почта"
        hint="Та, с которой вы вошли, или другая рабочая">
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={
            realEmail(worker?.email) || realEmail(email) || undefined
          }
          className={inputClass}
        />
      </Field>

      <Field label="Куратор при обучении">
        <Combobox
          items={curators}
          value={curator}
          itemToStringLabel={(item: Curator) => item.name}
          isItemEqualToValue={(a: Curator, b: Curator) => a.id === b.id}
          onValueChange={(value: Curator | null) => {
            setCurator(value)
            setMissingCurator(false)
          }}>
          <ComboboxInput
            aria-label="Куратор при обучении"
            aria-invalid={missingCurator}
            placeholder="Начните вводить позывной"
            className="h-11"
          />
          <ComboboxContent>
            <ComboboxEmpty>Никого не найдено</ComboboxEmpty>
            <ComboboxList>
              {(item: Curator) => (
                <ComboboxItem key={item.id} value={item}>
                  {item.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {missingCurator && (
          <span className="text-destructive text-sm">Выберите куратора</span>
        )}
      </Field>

      <Button
        type="submit"
        size="lg"
        className="mt-2 h-12 text-base"
        disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Отправить анкету
      </Button>
    </form>
  )
}
