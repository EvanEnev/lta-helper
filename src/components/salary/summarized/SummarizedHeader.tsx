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
} from '@heroui/react'
import {LTLocation, LTRank} from '@/src/utils/types'
import LocationSelect from '@/src/components/global/LocationSelect'

interface SummarizedHeaderProps {
  columns: SummaryColumn[]
  setDateRange: Dispatch<SetStateAction<RangeValue<DateValue> | null>>
  updateRank: (keys: Key[]) => void
  ranks: LTRank[]
  selectedRanks: string[]
  updateLocations: Dispatch<SetStateAction<number[]>>
}

export default function SummarizedHeader({
  columns,
  setDateRange,
  updateRank,
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
      </div>
      <div className="bg-surface flex h-fit w-full gap-2 rounded-2xl p-2">
        {columns.map(col => (
          <div
            className="bg-default flex flex-1 flex-col items-center justify-center rounded-xl p-2"
            key={col.title}>
            <p>{col.title}</p>
            <p className="text-foreground-500">{col.sumFn()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
