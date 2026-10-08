'use client'

import {useState} from 'react'
import {ChevronDown, Lock, Search} from 'lucide-react'
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
import LocationCombobox from '@/src/components/global/LocationCombobox'
import Location from '@/src/components/global/Location'
import Excel from '@/public/icons/Excel'
import fetchHandler from '@/src/utils/global/fetchHandler'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {
  LTLocation,
  LTMoneyOnLocationsData,
  LTWorkerPayrollData,
} from '@/src/utils/types'
import {locationFigures} from './DetailsMoney'

export type StatusFilter = 'all' | 'none' | 'confirmed' | 'issued'

const STATUS_ITEMS: {value: StatusFilter; label: string}[] = [
  {value: 'all', label: 'Все статусы'},
  {value: 'none', label: 'Без статуса'},
  {value: 'confirmed', label: 'Подтверждено'},
  {value: 'issued', label: 'Выдано'},
]

interface DetailsToolbarProps {
  payrollId: number
  data: LTWorkerPayrollData[]
  locationsData: LTMoneyOnLocationsData[]
  locationOptions: LTLocation[]
  locationName: string
  onLocationChange: (name: string) => void
  query: string
  onQueryChange: (value: string) => void
  status: StatusFilter
  onStatusChange: (value: StatusFilter) => void
  moneyOpen: boolean
  onMoneyToggle: () => void
  canEdit: boolean
}

export default function DetailsToolbar(props: DetailsToolbarProps) {
  const [confirmClose, setConfirmClose] = useState(false)
  const [isClosing, setClosing] = useState(false)

  const manyLocations = props.locationsData.length > 1
  const single = props.locationsData[0]
  const figures = single
    ? locationFigures(props.data, single.location_id)
    : null

  const close = async () => {
    setClosing(true)

    try {
      await fetchHandler({
        url: `/api/payrolls/${props.payrollId}/close`,
        method: 'PATCH',
      })
    } finally {
      setClosing(false)
      setConfirmClose(false)
    }
  }

  const download = async () => {
    const response = await fetch('/api/excel', {
      method: 'POST',
      body: JSON.stringify({id: props.payrollId, type: 'payroll'}),
    })

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'Ведомость.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={props.query}
          onChange={event => props.onQueryChange(event.target.value)}
          placeholder="Позывной"
          aria-label="Поиск по позывному"
          className="h-9 w-44 pl-8"
        />
      </div>

      <Select
        value={props.status}
        items={STATUS_ITEMS}
        onValueChange={value =>
          props.onStatusChange((value ?? 'all') as StatusFilter)
        }>
        <SelectTrigger className="h-9 w-44" aria-label="Статус">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_ITEMS.map(item => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-48">
        <LocationCombobox
          locations={props.locationOptions}
          value={props.locationName}
          onChange={props.onLocationChange}
          placeholder="Локация"
        />
      </div>

      {manyLocations ? (
        <Button
          variant="outline"
          className="h-9"
          aria-expanded={props.moneyOpen}
          onClick={props.onMoneyToggle}>
          Зарплатные деньги
          <ChevronDown
            className={cn(
              'transition-transform',
              props.moneyOpen && 'rotate-180',
            )}
          />
        </Button>
      ) : (
        single &&
        figures && (
          <div className="bg-muted/60 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg px-3 py-1.5 text-sm">
            <Location locationName={single.location} iconClassName="size-5" />
            <span>
              Выделено:{' '}
              <span className="text-primary font-medium tabular-nums">
                {separateNumber(single.value)}
              </span>
            </span>
            <span>
              Выдано:{' '}
              <span className="font-medium tabular-nums">
                {separateNumber(figures.issued)}
              </span>
            </span>
            <span>
              Остаток:{' '}
              <span className="text-success font-medium tabular-nums">
                {separateNumber(figures.toTake)}
              </span>
            </span>
          </div>
        )
      )}

      {props.canEdit && (
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" className="h-9" onClick={download}>
            <Excel width={20} height={20} />
            Скачать
          </Button>
          <Button
            variant="destructive"
            className="h-9"
            onClick={() => setConfirmClose(true)}>
            <Lock />
            Закрыть ведомость
          </Button>
        </div>
      )}

      <Dialog open={confirmClose} onOpenChange={setConfirmClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Закрыть ведомость?</DialogTitle>
            <DialogDescription>
              Остаток каждого сотрудника (сумма − выдано + бонусы − внешняя
              выплата) будет записан в его баланс. У сотрудников, которых нет в
              ведомости, баланс обнулится.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClose(false)}>
              Отмена
            </Button>
            <Button variant="destructive" disabled={isClosing} onClick={close}>
              Закрыть ведомость
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
