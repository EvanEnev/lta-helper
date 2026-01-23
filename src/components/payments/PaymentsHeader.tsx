import {Button, Input, ListBox, Select} from '@heroui/react-beta'
import {AddCircle} from 'solar-icon-set'
import {LTPayment, LTPaymentType} from '@/src/utils/types'
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react'
import {DateRangePicker, DateValue, RangeValue} from '@heroui/react'
import {PaymentsFilter} from '@/src/components/payments/PaymentsPage'
import {DateTime} from 'luxon'

interface PaymentsHeaderProps {
  paymentsTypes: LTPaymentType[]
  scrolled: boolean
  setFilters: Dispatch<SetStateAction<PaymentsFilter[]>>
  setPayments: Dispatch<SetStateAction<LTPayment[]>>
  canEdit: boolean
}

export default function PaymentsHeader({
  paymentsTypes,
  scrolled,
  setFilters,
  setPayments,
  canEdit,
}: PaymentsHeaderProps) {
  const [date, setDate] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [type, setType] = useState<string | null>(null)

  useEffect(() => {
    const filters: PaymentsFilter[] = []

    if (name) {
      filters.push({name: 'name', value: name})
    }

    if (date) {
      filters.push({name: 'dates', value: date})
    }

    if (type) {
      filters.push({name: 'type', value: type})
    }

    setFilters(filters)
  }, [name, date, type, setFilters])

  const parseDateRange = useCallback((range: RangeValue<DateValue> | null) => {
    if (!range) return setDate(null)
    const parsedStart = `${range.start.year}-${range.start.month >= 10 ? range.start.month : `0${range.start.month}`}-${range.start.day >= 10 ? range.start.day : `0${range.start.day}`}`
    const parsedEnd = `${range.end.year}-${range.end.month >= 10 ? range.end.month : `0${range.end.month}`}-${range.end.day >= 10 ? range.end.day : `0${range.end.day}`}`
    setDate(`${parsedStart}T00:00:00.00/${parsedEnd}T23:00:00.00`)
  }, [])

  return (
    <div
      className={`${scrolled ? 'scrolled' : ''} scrolled-prepare sticky top-4 left-4 z-1000 flex max-w-[90vw] flex-wrap gap-2 p-2`}>
      {canEdit && (
        <Button
          variant="secondary"
          onPress={() =>
            setPayments(prev => [
              {
                id: Math.max(...prev.map(d => d.id)) + 1,
                editMode: true,
                create: true,
                date: DateTime.now().toFormat('yyyy-MM-dd'),
              },
              ...prev,
            ])
          }>
          <AddCircle iconStyle="Bold" size={24} />
          Создать
        </Button>
      )}
      <Select
        placeholder="Выберите тип"
        onChange={type => {
          if (String(type) === 'all') return setType(null)
          setType(type ? String(type) : null)
        }}
        value={type}
        selectionMode="single">
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item key="all" id="all">
              Все
            </ListBox.Item>
            {paymentsTypes.map(d => (
              <ListBox.Item key={d.name} id={d.name}>
                {d.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <DateRangePicker
        className="w-fit"
        classNames={{inputWrapper: 'h-9 min-h-9'}}
        onChange={parseDateRange}
      />
      <Input
        placeholder="Позывной"
        id="nameInput"
        value={name || ''}
        onChange={e => setName(e.target.value || null)}
      />
    </div>
  )
}
