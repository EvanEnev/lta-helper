import {Separator, Tooltip} from '@heroui/react'
import {useMemo} from 'react'
import Location from '@/src/components/global/Location'
import {LTMoneyOnLocationsData, LTWorkerPayrollData} from '@/src/utils/types'
import separateNumber from '@/lib/functions/separateNumber'

interface PayrollsDetailsNoteProps {
  locationsData: LTMoneyOnLocationsData[]
  data: LTWorkerPayrollData[]
}

export default function PayrollsDetailsNote({
  locationsData,
  data,
}: PayrollsDetailsNoteProps) {
  const summaryBalance = useMemo(() => {
    return data.reduce(
      (acc, cur) =>
        acc +
        cur.value +
        (cur.bonuses || 0) -
        (cur.external_payment || 0) -
        (cur.taken || 0),
      0,
    )
  }, [data])

  const summaryValue = locationsData.reduce((acc, cur) => acc + cur.value, 0)
  const summaryIssued = data.reduce((acc, cur) => acc + (cur.taken || 0), 0)
  const summaryToTake = data.reduce(
    (acc, cur) =>
      acc + cur.value + (cur.bonuses || 0) - (cur.external_payment || 0),
    0,
  )

  return (
    <div className="grid grid-flow-col grid-rows-1 gap-2 p-2">
      {locationsData.map(locationData => {
        const locationIssued = data
          .filter(d => d.location_id === locationData.location_id)
          .reduce((acc, cur) => acc + (cur.taken || 0), 0)

        const locationToTake = data
          .filter(d => d.location_id === locationData.location_id)
          .reduce(
            (acc, cur) =>
              acc +
              cur.value +
              (cur.bonuses || 0) -
              (cur.external_payment || 0),
            0,
          )

        return (
          <div
            className="bg-default flex w-full flex-col gap-2 rounded-2xl p-2"
            key={locationData.location_id}>
            <Location
              className="w-fit text-sm break-all"
              iconClassName="w-[24px] h-[24px]"
              locationName={locationData.location}
            />
            <Separator className="bg-default-foreground" />
            <Tooltip>
              <Tooltip.Trigger>
                <p className="text-accent">
                  {separateNumber(locationData.value)}
                </p>
              </Tooltip.Trigger>
              <Tooltip.Content offset={10} placement="left">
                <Tooltip.Arrow />
                Выделено
              </Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger>
                <p>{separateNumber(locationToTake)}</p>
              </Tooltip.Trigger>
              <Tooltip.Content offset={10} placement="left">
                <Tooltip.Arrow />К выдаче
              </Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger>
                <p className="text-success">{separateNumber(locationIssued)}</p>
              </Tooltip.Trigger>
              <Tooltip.Content offset={10} placement="left">
                <Tooltip.Arrow />
                Выдано
              </Tooltip.Content>
            </Tooltip>
          </div>
        )
      })}
      <div className="bg-default flex w-full flex-col gap-2 rounded-2xl p-2">
        <p className="text-sm">Общее</p>
        <Separator className="bg-default-foreground" />
        <Tooltip>
          <Tooltip.Trigger>
            <p className="text-accent">{separateNumber(summaryValue)}</p>
          </Tooltip.Trigger>
          <Tooltip.Content offset={10} placement="left">
            <Tooltip.Arrow />
            Выделено
          </Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger>
            <p>{separateNumber(summaryToTake)}</p>
          </Tooltip.Trigger>
          <Tooltip.Content offset={10} placement="left">
            <Tooltip.Arrow />К выдаче
          </Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger>
            <p className="text-success">{separateNumber(summaryIssued)}</p>
          </Tooltip.Trigger>
          <Tooltip.Content offset={10} placement="left">
            <Tooltip.Arrow />
            Выдано
          </Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger>
            <p className="">{separateNumber(summaryBalance)}</p>
          </Tooltip.Trigger>
          <Tooltip.Content offset={10} placement="left">
            <Tooltip.Arrow />
            Общий остаток
          </Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  )
}
