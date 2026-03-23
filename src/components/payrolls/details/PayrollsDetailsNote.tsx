import {Button, Separator, Link} from '@heroui/react'
import {Fragment, useMemo} from 'react'
import Location from '@/src/components/global/Location'
import {LTMoneyOnLocationsData, LTWorkerPayrollData} from '@/src/utils/types'
import separateNumber from '@/lib/functions/separateNumber'
import {Icon} from '@iconify/react'

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

  return (
    <div className="sticky top-2 flex h-fit w-fit min-w-fit flex-col gap-2">
      <div className="flex w-full items-center gap-2">
        <Button
          className="w-full"
          as={Link}
          href="/payrolls"
          startContent={
            <Icon icon="solar:arrow-left-linear" width="24" height="24" />
          }>
          Назад
        </Button>
      </div>
      <div className="glass grid w-fit auto-rows-auto grid-cols-4 gap-2 rounded-2xl p-2">
        <p className="text-center">Локация</p>
        <p className="text-accent text-center">Выделено</p>
        <p className="text-center">К выдаче</p>
        <p className="text-success text-center">Выдано</p>
        {locationsData.map((locationData, index) => {
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
            <Fragment key={index}>
              <Separator className="col-span-full" />
              <Location
                className="w-fit break-all"
                locationName={locationData.location}
              />
              <p className="text-accent w-full min-w-fit">
                {separateNumber(locationData.value)}
              </p>
              <p className="w-full min-w-fit">
                {separateNumber(locationToTake)}
              </p>
              <p className="text-success w-full min-w-fit">
                {separateNumber(locationIssued)}
              </p>
            </Fragment>
          )
        })}
      </div>
      <div className="glass flex w-full flex-col gap-2 p-2">
        <p>Общий остаток</p>
        <Separator />
        <p className="text-success">{separateNumber(summaryBalance)}</p>
      </div>
    </div>
  )
}
