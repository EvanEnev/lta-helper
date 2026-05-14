import {
  Button,
  Input,
  ListBox,
  Select,
  DateRangePicker,
  DateValue,
  RangeValue,
  DateField,
  RangeCalendar,
} from '@heroui/react'
import {LTPayment, LTPaymentType} from '@/src/utils/types'
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react'
import {PaymentsFilter} from '@/src/components/payments/PaymentsPage'
import {DateTime, Interval} from 'luxon'
import separateNumber from '@/lib/functions/separateNumber'
import {Icon} from '@iconify/react'
import fetchHandler from '@/src/utils/global/fetchHandler'

interface PaymentsHeaderProps {
  summary: number
  paymentsTypes: LTPaymentType[]
  setFilters: Dispatch<SetStateAction<PaymentsFilter[]>>
  setPayments: Dispatch<SetStateAction<LTPayment[]>>
  canEdit: boolean
  initialDates: string
  getNewData: () => Promise<void>
}

export default function PaymentsHeader({
  summary,
  paymentsTypes,
  setFilters,
  setPayments,
  canEdit,
  initialDates,
  getNewData,
}: PaymentsHeaderProps) {
  const [date, setDate] = useState<string | null>(initialDates || null)
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

  const transfer = useCallback(async () => {
    if (!date) return
    const [startDate, endDate] = Interval.fromISO(date)
      .toFormat('yyyy-MM-dd', {separator: '/'})
      .split('/')

    await fetchHandler({
      url: '/api/payments/transfer',
      body: {startDate, endDate},
    })

    await getNewData()
  }, [date, getNewData])

  return (
    <div className="scrolled sticky top-4 left-4 z-1000 flex w-full flex-wrap gap-2 p-2">
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
          <Icon icon="solar:add-circle-bold" width="24" height="24" />
          Создать
        </Button>
      )}
      <DateRangePicker onChange={parseDateRange}>
        <DateField.Group lang="ru" variant="secondary">
          <DateField.Input slot="start">
            {segment => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateRangePicker.RangeSeparator />
          <DateField.Input slot="end">
            {segment => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DateRangePicker.Trigger>
              <DateRangePicker.TriggerIndicator />
            </DateRangePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DateRangePicker.Popover>
          <RangeCalendar aria-label="Choose trip dates">
            <RangeCalendar.Header>
              <RangeCalendar.YearPickerTrigger>
                <RangeCalendar.YearPickerTriggerHeading lang="ru-RU" />
                <RangeCalendar.YearPickerTriggerIndicator lang="ru-RU" />
              </RangeCalendar.YearPickerTrigger>
              <RangeCalendar.NavButton slot="previous" />
              <RangeCalendar.NavButton slot="next" />
            </RangeCalendar.Header>
            <RangeCalendar.Grid>
              <RangeCalendar.GridHeader>
                {day => (
                  <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                )}
              </RangeCalendar.GridHeader>
              <RangeCalendar.GridBody>
                {date => <RangeCalendar.Cell date={date} />}
              </RangeCalendar.GridBody>
            </RangeCalendar.Grid>
          </RangeCalendar>
        </DateRangePicker.Popover>
      </DateRangePicker>
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
      <Input
        placeholder="Позывной"
        id="nameInput"
        value={name || ''}
        onChange={e => setName(e.target.value || null)}
      />
      <div className="bg-surface h-full w-fit rounded-xl p-2">
        <p>Сумма: {separateNumber(summary)}</p>
      </div>
      <Button onPress={transfer} variant="secondary">
        Перенести из Консоли
      </Button>
    </div>
  )
}
