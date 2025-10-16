import {DateTime} from 'luxon'
import {Autocomplete, AutocompleteItem, Select, SelectItem} from '@heroui/react'
import {useCallback} from 'react'
import capitalize from '@/lib/functions/capitalize'

export default function MonthSelect({
  dates,
  callback,
  date,
  showLabel = true,
  className = '',
  labelPlacement = 'outside',
  type = 'autocomplete',
}: {
  dates: string[]
  callback: any
  date: string
  showLabel?: boolean
  className?: string
  labelPlacement?: 'outside' | 'outside-left' | 'inside' | undefined
  type?: 'autocomplete' | 'select'
}) {
  const datetimes = dates.map(date => DateTime.fromISO(date))

  const onChange = useCallback(
    (date: any) => {
      callback(date)
    },
    [callback],
  )

  if (type === 'autocomplete') {
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
  } else if (type === 'select') {
    return (
      <Select
        required
        className={className}
        classNames={{
          innerWrapper: className,
          mainWrapper: className,
        }}
        label={showLabel ? 'Месяц' : ''}
        labelPlacement={labelPlacement}
        onSelectionChange={onChange}
        selectedKeys={[date]}
        aria-label="Выбор месяца">
        {datetimes.map(date => (
          <SelectItem key={date.toFormat('yyyy-MM-dd')} className="w-full">
            {capitalize(date.toFormat('LLLL, yyyy', {locale: 'ru-RU'}))}
          </SelectItem>
        ))}
      </Select>
    )
  }
}
