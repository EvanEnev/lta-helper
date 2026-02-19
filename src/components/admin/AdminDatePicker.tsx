import {DateTime} from 'luxon'
import {DatePicker, DateValue} from '@heroui/react'
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
      variant="bordered"
      aria-label="Дата"
      errorMessage="Дата вне диапазона"
      isDateUnavailable={date =>
        checkDateValid(DateTime.fromJSDate(date.toDate('Europe/Moscow')))
      }
      selectorButtonPlacement="start"
      firstDayOfWeek="mon"
      className="h-16 w-full p-0!"
      classNames={{inputWrapper: 'h-16'}}
      onChange={updateCallback}
      // @ts-ignore
      defaultValue={today('Europe/Moscow')}
    />
  )
}
