import {DateTime} from 'luxon'
import {Autocomplete, AutocompleteItem} from '@heroui/react'
import {useCallback, useMemo, useState} from 'react'
import capitalize from '@/lib/functions/capitalize'

export default function MonthSelect({
  dates,
  callback,
}: {
  dates: string[]
  callback: any
}) {
  const currentDate = useMemo(() => DateTime.now().set({day: 1}), [])
  const [selectedDate, setSelectedDate] = useState(
    currentDate.toFormat('yyyy-MM-dd'),
  )
  const datetimes = dates.map(date => DateTime.fromISO(date))

  const onChange = useCallback(
    (date: any) => {
      setSelectedDate(date)
      callback(date)
    },
    [callback],
  )

  return (
    <Autocomplete
      required
      clearButtonProps={{hidden: true}}
      label="Месяц"
      labelPlacement="outside"
      onSelectionChange={onChange}
      selectedKey={selectedDate}
      aria-label="Выбор месяца">
      {datetimes.map(date => (
        <AutocompleteItem key={date.toFormat('yyyy-MM-dd')}>
          {capitalize(date.toFormat('LLLL', {locale: 'ru-RU'}))}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  )
}
