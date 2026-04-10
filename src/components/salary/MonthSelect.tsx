import {DateTime} from 'luxon'
import {
  Autocomplete,
  Label,
  ListBox,
  SearchField,
  Select,
  useFilter,
} from '@heroui/react'
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
  const {contains} = useFilter()
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
        isRequired
        variant="secondary"
        fullWidth
        value={date}
        onChange={onChange}>
        <Label>{showLabel ? 'Месяц' : ''}</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField autoFocus name="search" variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox>
              {datetimes.map(date => (
                <ListBox.Item
                  id={date.toFormat('yyyy-MM-dd')}
                  key={date.toFormat('yyyy-MM-dd')}>
                  {capitalize(date.toFormat('LLLL', {locale: 'ru-RU'}))}
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
      // <Autocomplete
      //   required
      //   className={className}
      //   clearButtonProps={{hidden: true}}
      //   label={showLabel ? 'Месяц' : ''}
      //   labelPlacement={labelPlacement}
      //   onSelectionChange={onChange}
      //   selectedKey={date}
      //   aria-label="Выбор месяца">
      //   {datetimes.map(date => (
      //     <AutocompleteItem key={date.toFormat('yyyy-MM-dd')}>
      //       {capitalize(date.toFormat('LLLL', {locale: 'ru-RU'}))}
      //     </AutocompleteItem>
      //   ))}
      // </Autocomplete>
    )
  } else if (type === 'select') {
    return (
      <Select
        variant="secondary"
        isRequired
        className={className}
        onChange={value => onChange(value)}
        value={date}
        aria-label="Выбор месяца">
        <Label>{showLabel ? 'Месяц' : ''}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {datetimes.map(date => (
              <ListBox.Item
                id={date.toFormat('yyyy-MM-dd')}
                key={date.toFormat('yyyy-MM-dd')}
                className="w-full">
                {capitalize(date.toFormat('LLLL, yyyy', {locale: 'ru-RU'}))}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    )
  }
}
