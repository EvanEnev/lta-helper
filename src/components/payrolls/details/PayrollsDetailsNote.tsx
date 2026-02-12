import {Button, Code, Divider, Link} from '@heroui/react'
import {ArrowLeft} from 'solar-icon-set'
import LocationSelect from '@/src/components/global/LocationSelect'
import {Fragment, useMemo} from 'react'
import Location from '@/src/components/global/Location'
import {
  LTLocation,
  LTMoneyOnLocationsData,
  LTWorkerPayrollData,
} from '@/src/utils/types'
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

  return (
    <div className="sticky top-2 flex h-fit w-fit min-w-fit flex-col gap-2">
      <div className="flex w-full items-center gap-2">
        <Button
          className="w-full"
          as={Link}
          href="/payrolls"
          startContent={<ArrowLeft />}>
          Назад
        </Button>
      </div>
      <div className="glass grid w-fit auto-rows-auto grid-cols-4 gap-2 rounded-2xl p-2">
        <p className="text-center">Локация</p>
        <Code color="primary" className="text-center">
          Выделено
        </Code>
        <Code className="text-center">К выдаче</Code>
        <Code color="success" className="text-center">
          Выдано
        </Code>
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
              <Divider className="col-span-full" />
              <Location
                className="w-fit break-all"
                locationName={locationData.location}
              />
              <Code className="w-full min-w-fit" color="primary">
                {separateNumber(locationData.value)}
              </Code>
              <Code className="w-full min-w-fit">
                {separateNumber(locationToTake)}
              </Code>
              <Code className="w-full min-w-fit" color="success">
                {separateNumber(locationIssued)}
              </Code>
            </Fragment>
          )
        })}
      </div>
      <div className="glass flex w-full flex-col gap-2 p-2">
        <p>Общий остаток</p>
        <Divider />
        <Code color="success">{separateNumber(summaryBalance)}</Code>
      </div>
    </div>
  )
}
