import {
  Button,
  DateField,
  DateRangePicker,
  DateValue,
  Label,
  RangeCalendar,
  RangeValue,
} from '@heroui/react'
import {Icon} from '@iconify/react'

interface DateRangePickerProps {
  value: RangeValue<DateValue> | null
  callback: (value: RangeValue<DateValue> | null) => void
  label: string
  isClearable?: boolean
}

export default function CalendarPicker({
  value,
  callback,
  label,
  isClearable = false,
}: DateRangePickerProps) {
  return (
    <div className="flex w-full gap-2">
      <DateRangePicker className="w-full" value={value} onChange={callback}>
        <Label>{label}</Label>
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
      {isClearable && (
        <Button
          onPress={() => callback(null)}
          variant="outline"
          className="self-end opacity-50"
          isIconOnly>
          <Icon icon="maki:cross" width="15" height="15" />
        </Button>
      )}
    </div>
  )
}
