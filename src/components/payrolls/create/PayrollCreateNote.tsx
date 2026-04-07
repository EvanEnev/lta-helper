import {Input} from '@heroui/react-beta'
import Location from '@/src/components/global/Location'
import {LTLocation, LTPayrollData} from '@/src/utils/types'
import separateNumber from '@/lib/functions/separateNumber'
import {evaluate} from 'mathjs'

interface PayrollCreateNoteProps {
  locations: LTLocation[]
  locationsToHide: LTLocation['name'][]
  moneyOnLocations: {
    location: LTLocation['id']
    value: number
    error?: boolean
  }[]
  payrollData: LTPayrollData[]
  updateLocationMoneyCallback: (
    location: LTLocation['id'],
    value: string,
  ) => void
}

export default function PayrollCreateNote({
  locations,
  locationsToHide,
  moneyOnLocations,
  payrollData,
  updateLocationMoneyCallback,
}: PayrollCreateNoteProps) {
  return (
    <div className="sticky top-20 z-1000 grid grid-flow-col grid-rows-3 gap-2 p-1">
      {locations
        .filter(l => !locationsToHide.includes(l.name.toLowerCase()))
        .map(location => {
          const locationData = moneyOnLocations.find(
            d => d.location === location.id,
          )!

          const locationMoney = locationData?.value || undefined

          const usedMoney = payrollData
            .filter(d => d.location === location.id)
            .reduce(
              (acc, d) =>
                acc +
                (d.balance || 0) +
                (d.fines || 0) +
                (d.bonuses || 0) +
                (d.value || 0) -
                (d.external_payment || 0),
              0,
            )

          return (
            <div
              className="bg-content1 flex flex-col rounded-2xl p-2"
              key={location.id}>
              <Location
                iconClassName="w-6"
                className="text-xs"
                locationName={location.name!}
              />
              <div className="flex gap-2">
                <Input
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.currentTarget.value = evaluate(e.currentTarget.value)
                    }
                  }}
                  variant="secondary"
                  defaultValue={locationMoney?.toString() || undefined}
                  placeholder="0"
                  onChange={event =>
                    updateLocationMoneyCallback(location.id, event.target.value)
                  }
                />
                <div className="bg-content2 flex h-10 w-20 items-center rounded-xl px-2 text-center text-sm">
                  <p
                    className={`${(locationMoney || 0) - usedMoney < 0 ? 'text-danger' : ''} truncate`}>
                    {separateNumber((locationMoney || 0) - usedMoney)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}
