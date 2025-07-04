import {DateTime} from 'luxon'
import {Autocomplete, AutocompleteItem} from '@heroui/react'
import {useCallback} from 'react'
import capitalize from '@/lib/functions/capitalize'

export default function MonthSelect({
  dates,
  callback,
  date,
}: {
  dates: string[]
  callback: any
  date: string
}) {
  const datetimes = dates.map(date => DateTime.fromISO(date))

  const onChange = useCallback(
    (date: any) => {
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
      selectedKey={date}
      aria-label="Выбор месяца">
      {datetimes.map(date => (
        <AutocompleteItem key={date.toFormat('yyyy-MM-dd')}>
          {capitalize(date.toFormat('LLLL', {locale: 'ru-RU'}))}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  )
}
