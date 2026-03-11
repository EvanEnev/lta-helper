import {DateTime} from 'luxon'
import type {DateValue} from '@internationalized/date'
import {Calendar, DateField, DatePicker} from '@heroui/react-beta'
import {today} from '@internationalized/date'
import {useCallback} from 'react'

interface AdminDatePickerProps {
  callback: (date: DateValue | null) => void
  canEdit: boolean
}

export default function AdminDatePicker({
  callback,
  canEdit: canEditAll,
}: AdminDatePickerProps) {
  const checkDateValid = useCallback(
    (date: DateTime) => {
      if (canEditAll) return false

      const now = DateTime.now()

      let isInvalid = false

      const diff = -Math.floor(now.diff(date).as('days'))

      if (diff <= -2 || diff >= 2) isInvalid = true
      if (diff === -1 && now.hour > 3) isInvalid = true

      return isInvalid
    },
    [canEditAll],
  )

  const updateCallback = useCallback(
    (date: DateValue | null) => {
      if (!date) return

      const isDateInvalid = checkDateValid(
        DateTime.fromJSDate(date.toDate('Europe/Moscow')),
      )

      if (!isDateInvalid) {
        callback(date)
      }
    },
    [callback, checkDateValid],
  )

  return (
    <DatePicker
      isDateUnavailable={date =>
        checkDateValid(DateTime.fromJSDate(date.toDate('Europe/Moscow')))
      }
      name="date"
      defaultValue={today('Europe/Moscow')}
      onChange={updateCallback}>
      <DateField.Group fullWidth variant="secondary">
        <DateField.Input>
          {segment => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label="Дата">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {day => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {date => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({year}) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  )
}
