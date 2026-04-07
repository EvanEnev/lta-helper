import {PayrollColumn} from '@/src/components/payrolls/create/PayrollCreatePage'
import {Code, semanticColors} from '@heroui/react'
import {
  Button,
  Disclosure,
  DatePicker,
  Calendar,
  DateField,
} from '@heroui/react-beta'
import {Icon} from '@iconify/react'
import PayrollCreateNote from '@/src/components/payrolls/create/PayrollCreateNote'
import {useTheme} from 'next-themes'
import {useMemo} from 'react'
import {Interval} from 'luxon'
import {LTLocation, LTPayrollData} from '@/src/utils/types'
import {parseDate} from '@internationalized/date'

interface PayrollCreateHeaderProps {
  columns: PayrollColumn[]
  locations: LTLocation[]
  dates: {start: string; end: string}
  bonuses: boolean
  moneyOnLocations: {
    location: LTLocation['id']
    value: number
  }[]
  payrollData: LTPayrollData[]
  locationsToHide: string[]
  updateLocationMoney: (locationId: number, rawValue: string) => void
  sendData: (isPublished: boolean) => void
  takeBy: string
  setTakeBy: (date: string) => void
}

export default function PayrollCreateHeader({
  columns,
  locations,
  dates,
  bonuses,
  moneyOnLocations,
  payrollData,
  locationsToHide,
  updateLocationMoney,
  sendData,
  takeBy,
  setTakeBy,
}: PayrollCreateHeaderProps) {
  const {theme} = useTheme()
  // @ts-ignore
  const themeColors = semanticColors[theme || 'dark']

  const interval = useMemo(() => {
    return Interval.fromISO(`${dates.start}/${dates.end}`)
  }, [dates.start, dates.end])

  return (
    <div className="bg-content1 sticky top-2 z-1000 flex flex-col rounded-2xl">
      <div className="flex gap-2">
        <Disclosure className="w-full">
          <Disclosure.Heading className="flex items-center gap-2 p-2">
            <Button
              slot="trigger"
              className="flex h-fit w-full items-center gap-2"
              variant="tertiary">
              <p className="underline">{interval.toFormat('dd.MM.yyyy')}</p>
              <div className="flex items-center gap-2 p-2">
                Бонусы:{' '}
                {bonuses ? (
                  <Icon
                    color={themeColors.success['500']}
                    icon="solar:check-circle-bold"
                    width="20"
                    height="20"
                  />
                ) : (
                  <Icon
                    icon="solar:close-circle-bold"
                    width="20"
                    height="20"
                    color={themeColors.danger['500']}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 p-2">
                <p>Сотрудники:</p>
                <Code color="success" className="flex items-center gap-2">
                  {payrollData.reduce(
                    (acc, cur) =>
                      acc +
                      ((cur.fines || 0) +
                        Number(cur.value || 0) +
                        (cur.bonuses || 0) -
                        (cur.external_payment || 0)),
                    0,
                  )}
                  <Icon icon="solar:ruble-bold" width="24" height="24" />
                </Code>
              </div>
              <div className="flex items-center gap-2 p-2">
                <p>Площадки:</p>
                <Code color="primary" className="flex items-center gap-2">
                  {moneyOnLocations.reduce((acc, cur) => acc + cur.value, 0)}
                  <Icon icon="solar:ruble-bold" width="24" height="24" />
                </Code>
              </div>
              <Disclosure.Indicator />
            </Button>
            <DatePicker
              defaultValue={parseDate(takeBy)}
              onChange={d => setTakeBy(d?.toString() || '')}
              name="date">
              <DateField.Group className="h-12" variant="secondary" fullWidth>
                <DateField.Input>
                  {segment => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                  <DatePicker.Trigger>
                    <DatePicker.TriggerIndicator />
                  </DatePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DatePicker.Popover className="min-w-fit">
                <Calendar aria-label="Event date">
                  <Calendar.Header>
                    <Calendar.YearPickerTrigger>
                      <Calendar.YearPickerTriggerHeading />
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
            <Button
              className="h-12"
              variant="secondary"
              onPress={() => sendData(false)}>
              <Icon icon="solar:diskette-bold" width="24" height="24" />
              Сохранить
            </Button>
            <Button
              className="h-12"
              variant="primary"
              onPress={() => sendData(true)}>
              <Icon icon="solar:plain-bold" width="24" height="24" />
              Опубликовать
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body className="rounded-2xl border">
              <PayrollCreateNote
                locations={locations}
                locationsToHide={locationsToHide}
                moneyOnLocations={moneyOnLocations}
                payrollData={payrollData}
                updateLocationMoneyCallback={updateLocationMoney}
              />
            </Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
      </div>
      <div className="flex h-fit w-full gap-2 p-2">
        {columns.map(col => (
          <div
            className="bg-content2 flex flex-1 flex-col items-center justify-center rounded-xl p-2"
            key={col.title}>
            <p>{col.title}</p>
            <p className="text-foreground-500">{col.sumFn()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
