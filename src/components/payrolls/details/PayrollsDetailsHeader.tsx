import {Button, Disclosure, Input, Label, ListBox, Select} from '@heroui/react'
import {Icon} from '@iconify/react'
import LocationSelect from '@/src/components/global/LocationSelect'
import {
  LTLocation,
  LTMoneyOnLocationsData,
  LTWorkerPayrollData,
} from '@/src/utils/types'
import unaccent from '@/lib/functions/unaccent'
import useColors from '@/src/hooks/useColors'
import PayrollsDetailsNote from '@/src/components/payrolls/details/PayrollsDetailsNote'
import {useCallback, useMemo} from 'react'
import Location from '@/src/components/global/Location'
import fetchHandler from '@/src/utils/global/fetchHandler'

interface PayrollsDetailsHeaderProps {
  payrollId: number
  filterChangeCallback: (
    filter: string,
    value: string | number | LTLocation | LTLocation[] | null,
  ) => void
  locationsData: LTMoneyOnLocationsData[]
  data: LTWorkerPayrollData[]
  canEdit: boolean
}

export default function PayrollsDetailsHeader({
  payrollId,
  locationsData,
  data,
  filterChangeCallback,
  canEdit,
}: PayrollsDetailsHeaderProps) {
  const colors = useColors()

  const locationIssued = useMemo(
    () =>
      data
        .filter(d => d.location_id === locationsData[0].location_id)
        .reduce((acc, cur) => acc + (cur.taken || 0), 0),
    [data, locationsData],
  )

  const locationToTake = useMemo(
    () =>
      data
        .filter(d => d.location_id === locationsData[0].location_id)
        .reduce(
          (acc, cur) =>
            acc + cur.value + (cur.bonuses || 0) - (cur.external_payment || 0),
          0,
        ),
    [data, locationsData],
  )

  const closePayroll = useCallback(async () => {
    const url = `/api/payrolls/${payrollId}/close`

    await fetchHandler({url, method: 'PATCH'})
  }, [payrollId])

  return (
    <div className="bg-surface sticky top-2 z-1000 flex flex-col rounded-2xl">
      <div className="flex gap-2">
        <Disclosure className="w-full">
          <Disclosure.Heading className="flex items-center gap-2 p-2">
            <Input
              className="h-10"
              onChange={e =>
                filterChangeCallback(
                  'name',
                  unaccent(e.currentTarget.value.toLowerCase()),
                )
              }
              variant="secondary"
              placeholder="Позывной"
            />
            <Select
              variant="secondary"
              placeholder="Статус"
              onChange={v => {
                filterChangeCallback('status', v)
              }}>
              <Select.Trigger className="h-10">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id={0}>
                    <Label className="flex gap-2">
                      <Icon
                        icon="solar:menu-dots-circle-bold"
                        width="24"
                        height="24"
                      />
                      Все
                    </Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id={1}>
                    <Label className="flex gap-2">
                      <Icon
                        icon="solar:close-circle-bold"
                        width="24"
                        height="24"
                        style={{color: colors?.default}}
                      />
                      Без статуса
                    </Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id={2}>
                    <Label className="flex gap-2">
                      <Icon
                        icon="solar:danger-circle-bold"
                        width="24"
                        height="24"
                        style={{color: colors?.accent}}
                      />
                      Подтверждено
                    </Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id={3}>
                    <Label className="flex gap-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        width="24"
                        height="24"
                        style={{color: colors?.success}}
                      />
                      Выдано
                    </Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <LocationSelect
              includeAll
              className="h-10"
              placeholder="Локация"
              showLabel={false}
              callback={l =>
                filterChangeCallback(
                  'location',
                  (l as LTLocation)?.id === 0 ? null : l,
                )
              }
              locationId={-1}
            />
            {locationsData.length > 1 ? (
              <Button
                slot="trigger"
                className="flex h-10 w-full items-center gap-2"
                variant="tertiary">
                <p>Зарплатные деньги</p>
                <Disclosure.Indicator />
              </Button>
            ) : (
              <div className="bg-default flex h-fit w-full items-center justify-around gap-2 rounded-3xl p-2">
                <Location
                  iconClassName="h-[24px] w-[24px]"
                  locationName={locationsData[0].location}
                />
                <p>
                  Выделено:{' '}
                  <span className="text-accent underline">
                    {locationsData[0].value}
                  </span>
                </p>
                <p>
                  Выдано: <span className="underline">{locationIssued}</span>
                </p>

                <p>
                  Остаток:{' '}
                  <span className="text-success underline">
                    {locationToTake}
                  </span>
                </p>
              </div>
            )}
            {canEdit && (
              <Button variant="danger-soft" onPress={closePayroll}>
                Закрыть ведомость
              </Button>
            )}
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body className="rounded-2xl border">
              <PayrollsDetailsNote locationsData={locationsData} data={data} />
            </Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
      </div>
    </div>
  )
}
