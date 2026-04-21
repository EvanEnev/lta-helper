import {SummaryColumn} from '@/src/components/salary/summarized/SummarizedPage'
import {Dispatch, SetStateAction, useCallback} from 'react'
import {
  Select,
  DateField,
  DateRangePicker,
  RangeCalendar,
  ListBox,
  Label,
  Key,
  DateValue,
  RangeValue,
  Button,
} from '@heroui/react'
import {LTLocation, LTRank} from '@/src/utils/types'
import LocationSelect from '@/src/components/global/LocationSelect'
import {Interval} from 'luxon'
import Excel from '@/public/icons/Excel'

interface SummarizedHeaderProps {
  columns: SummaryColumn[]
  setDateRange: Dispatch<SetStateAction<RangeValue<DateValue> | null>>
  dateRange: RangeValue<DateValue> | null
  updateRank: (keys: Key[]) => void
  ranks: LTRank[]
  selectedRanks: string[]
  updateLocations: Dispatch<SetStateAction<number[]>>
}

export default function SummarizedHeader({
  columns,
  setDateRange,
  updateRank,
  dateRange,
  ranks,
  selectedRanks,
  updateLocations,
}: SummarizedHeaderProps) {
  const locationsCallback = useCallback(
    (locations: (LTLocation | LTLocation[]) | null) => {
      if (!locations) return updateLocations([])

      updateLocations(Array.isArray(locations) ? locations.map(l => l.id) : [])
    },
    [updateLocations],
  )

  const download = useCallback(
    async (type: string) => {
      const response = await fetch('/api/excel', {
        method: 'POST',
        body: JSON.stringify({
          start_date: dateRange?.start.toString(),
          end_date: dateRange?.end.toString(),
          type,
        }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const interval = Interval.fromISO(
        `${dateRange?.start.toString()}/${dateRange?.end.toString()}`,
      )

      let name = 'Сводная'
      if (type === 'day') {
        name += ` по дням (${interval.toFormat('dd.MM.yyyy')})`
      } else if (type === 'month') {
        name += ' по месяцам'
      } else if (type === 'workers') {
        name += ` по сотрудникам (${interval.toFormat('dd.MM.yyyy')})`
      }
      a.download = `${name}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    },
    [dateRange?.end, dateRange?.start],
  )

  return (
    <div className="sticky top-2 flex flex-col gap-1">
      <div className="bg-surface flex h-fit w-full gap-2 rounded-2xl p-2">
        <DateRangePicker onChange={val => setDateRange(val)}>
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
          className="w-60"
          value={selectedRanks}
          variant="secondary"
          selectionMode="multiple"
          onChange={v => updateRank(v)}>
          <Select.Trigger>
            <Select.Value className="truncate" />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="max-w-32">
            <ListBox>
              <ListBox.Item textValue="Все" key={'all'} id={'all'}>
                <Label>Все</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
              {ranks.map(rank => (
                <ListBox.Item
                  textValue={rank.name}
                  key={rank.name}
                  id={rank.name}>
                  <Label>{rank.name}</Label>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <LocationSelect
          className="w-60"
          showLabel={false}
          selectionMode="multiple"
          callback={locationsCallback}
          locationId={0}
          includeAll
        />
        <Button variant="tertiary" onPress={() => download('day')}>
          <Excel width={40} height={40} />
          Скачать по дням
        </Button>
        <Button variant="tertiary" onPress={() => download('month')}>
          <Excel width={40} height={40} />
          Скачать по месяцам
        </Button>
        <Button variant="tertiary" onPress={() => download('workers')}>
          <Excel width={40} height={40} />
          Скачать по сотрудникам
        </Button>
        {/*<Button variant="tertiary" onPress={() => download('summary')}>*/}
        {/*  <Excel width={40} height={40} />*/}
        {/*  Скачать сводную по месяцам*/}
        {/*</Button>*/}
      </div>
      <div className="bg-surface flex h-fit w-full gap-2 rounded-2xl p-2">
        {columns.map(col => (
          <div
            className="bg-default flex flex-1 flex-col items-center justify-center rounded-xl p-2"
            key={col.title}>
            <p>{col.title}</p>
            <p className="text-foreground/60">{col.sumFn()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
