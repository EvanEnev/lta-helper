'use client'

import {useId} from 'react'
import {Gamepad2} from 'lucide-react'
import {withMask} from 'use-mask-input'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {Input} from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import FormulaField from '@/src/components/global/FormulaField'
import LocationCombobox from '@/src/components/global/LocationCombobox'
import getSalaryData from '@/lib/functions/getSalaryData'
import type {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  LTWorker,
  LTWorkType,
  WorkerSalary,
} from '@/src/utils/types'
import {Counter, NumberInput} from '@/src/components/global/NumberInput'
import WorkerCombobox from '@/src/components/global/WorkerCombobox'
import {
  GameEntry,
  GameKey,
  PAYMENT_TYPES,
  TYPED_LOCATION,
  getFaceIdTimes,
} from './utils'

interface WorkFormProps {
  data: WorkerSalary
  salary: ReturnType<typeof getSalaryData>
  worker?: LTWorker // выбранный сотрудник
  workers: LTWorker[]
  locations: LTLocation[]
  workTypes: LTWorkType[]
  gamesPayments: LTGamePayment[]
  faceId: LTFaceIdData[]
  onChange: (patch: Partial<WorkerSalary>) => void
}

function Field({
  label,
  htmlFor,
  hint,
  reserveHint = false,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
  // всегда оставлять место под подсказку, чтобы поля в соседних карточках
  // не съезжали, когда подсказка есть только у одной из них
  reserveHint?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {(hint || reserveHint) && (
        <div className="text-muted-foreground min-h-4 text-xs">{hint}</div>
      )}
    </div>
  )
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  )
}

export default function WorkForm({
  data,
  salary,
  worker,
  workers,
  locations,
  workTypes,
  gamesPayments,
  faceId,
  onChange,
}: WorkFormProps) {
  const id = useId()
  const isTyped = data.location === TYPED_LOCATION
  const isActor = worker?.rank === 'Актёр'
  const faceIdTimes = getFaceIdTimes(faceId, workers, data.worker)

  // типы работ приходят то числами, то строками - сравниваем как строки
  const selectedTypes = (data.workTypes ?? []).map(String)

  const toggleType = (typeId: string) =>
    onChange({
      workTypes: (selectedTypes.includes(typeId)
        ? selectedTypes.filter(t => t !== typeId)
        : [...selectedTypes, typeId]) as unknown as WorkerSalary['workTypes'],
    })

  const gamesTypes = gamesPayments.filter(d =>
    isActor ? d.rank === 12 : d.rank !== 12,
  )

  const gamesSum = (
    ['oneGames', 'twoGames', 'threeGames', 'actorGames'] as const
  )
    .map(key => data[key]?.value || salary?.[key] || 0)
    .reduce((sum, value) => sum + value, 0)

  const setGame = (
    key: GameKey,
    game: LTGamePayment,
    patch: Partial<GameEntry>,
  ) => {
    const current = data[key]

    onChange({
      [key]: {
        id: current?.id ?? game.id,
        number: current?.number ?? 0,
        value: current?.value,
        ...patch,
      } as GameEntry,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Field
        label="Сотрудник"
        reserveHint
        hint={
          faceIdTimes && (
            <div className="flex justify-between gap-2">
              <span>Вход: {faceIdTimes.entry ?? <i>нет</i>}</span>
              <span>Выход: {faceIdTimes.exit ?? <i>нет</i>}</span>
            </div>
          )
        }>
        <WorkerCombobox
          workers={workers}
          value={data.worker}
          onChange={name => onChange({worker: name})}
        />
      </Field>

      <Field label="Локация">
        <LocationCombobox
          locations={locations}
          value={data.location}
          onChange={name => onChange({location: name})}
        />
      </Field>

      <Field label={isTyped ? 'Тип' : 'Типы работ'}>
        {isTyped ? (
          <Select
            value={data.type || null}
            items={PAYMENT_TYPES.map(type => ({value: type, label: type}))}
            onValueChange={value => onChange({type: value ?? ''})}>
            <SelectTrigger className="w-full" aria-label="Тип">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {workTypes.map(type => {
              const active = selectedTypes.includes(String(type.id))

              return (
                <Button
                  key={type.id}
                  size="sm"
                  variant={active ? 'default' : 'outline'}
                  aria-pressed={active}
                  onClick={() => toggleType(String(type.id))}>
                  {type.name}
                </Button>
              )
            })}
          </div>
        )}
      </Field>

      {!isTyped && (
        <Field label="Время работы" htmlFor={`${id}-hours`}>
          <Input
            id={`${id}-hours`}
            placeholder="__-__"
            inputMode="numeric"
            required
            value={data.workingHours}
            ref={withMask('99-99', {inputmode: 'numeric', placeholder: '_'})}
            onChange={event => onChange({workingHours: event.target.value})}
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Смена"
          reserveHint={!isTyped}
          hint={
            !isTyped &&
            salary?.start_time &&
            salary?.end_time &&
            `${salary.start_time}-${salary.end_time}`
          }>
          <NumberInput
            label="Смена"
            value={salary?.value}
            onChange={value => onChange({value})}
          />
        </Field>
        {!isTyped && (
          <Field label="Переработка" reserveHint>
            <NumberInput
              label="Переработка"
              value={salary?.overwork}
              onChange={overwork => onChange({overwork})}
            />
          </Field>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FormulaField
          label="Бонусы"
          value={data.bonuses}
          callback={({text, error}) => !error && onChange({bonuses: text})}
        />
        <FormulaField
          label="Штрафы"
          value={data.fines}
          callback={({text, error}) => !error && onChange({fines: text})}
        />
      </div>

      {(!isTyped && !isActor) ||
      (!isTyped && worker?.rank === 'Железный') ||
      (data.type && isTyped) ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {!isTyped && !isActor && (
            <CheckField
              label="Загруз"
              checked={!!data.isHardTime}
              onChange={isHardTime => onChange({isHardTime})}
            />
          )}
          {!isTyped && worker?.rank === 'Железный' && (
            <CheckField
              label="Есть игры"
              checked={!!data.hasGames}
              onChange={hasGames => onChange({hasGames})}
            />
          )}
          {data.type && isTyped && (
            <CheckField
              label="Без даты"
              checked={!!data.withoutDate}
              onChange={withoutDate => onChange({withoutDate})}
            />
          )}
        </div>
      ) : null}

      {!isTyped && gamesTypes.length > 0 && (
        <Accordion className="rounded-lg border px-3">
          <AccordionItem value="games">
            <AccordionTrigger className="items-center">
              <span className="flex items-center gap-2">
                <Gamepad2 className="size-4" />
                Игры{gamesSum ? ` (${gamesSum})` : ''}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3 pt-1">
                {gamesTypes.map(game => {
                  const key = game.key as GameKey
                  const current = data[key]

                  return (
                    <div
                      key={game.id}
                      className="flex flex-wrap items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 basis-32 text-sm">
                        {game.description}
                      </span>
                      <Counter
                        label={game.description}
                        value={current?.number ?? 0}
                        // смена количества сбрасывает ручной результат, как раньше
                        onChange={number =>
                          onChange({
                            [key]: {id: game.id, number} as GameEntry,
                          })
                        }
                      />
                      <NumberInput
                        label={`${game.description}: результат`}
                        placeholder="Результат"
                        className="w-24"
                        value={current?.value || salary?.[key]}
                        onChange={value =>
                          current &&
                          setGame(key, game, {value: value as number})
                        }
                      />
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <Field label="Комментарий" htmlFor={`${id}-comment`}>
        <Textarea
          id={`${id}-comment`}
          value={data.comment}
          onChange={event => onChange({comment: event.target.value})}
        />
      </Field>
    </div>
  )
}
