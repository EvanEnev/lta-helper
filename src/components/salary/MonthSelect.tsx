import {DateTime} from 'luxon'
import {Autocomplete, AutocompleteItem} from '@heroui/react'
import {useCallback} from 'react'
import capitalize from '@/lib/functions/capitalize'

export default function MonthSelect({
  dates,
  callback,
  date,
  showLabel = true,
  className = '',
  labelPlacement = 'outside',
}: {
  dates: string[]
  callback: any
  date: string
  showLabel?: boolean
  className?: string
  labelPlacement?:
    | 'outside'
    | 'outside-left'
    | 'outside-top'
    | 'inside'
    | undefined
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
      className={className}
      clearButtonProps={{hidden: true}}
      label={showLabel ? 'Месяц' : ''}
      labelPlacement={labelPlacement}
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
