import {Code, DatePicker} from '@heroui/react'
import {Button, Input, Separator} from '@heroui/react-beta'
import {Fragment} from 'react'
import Location from '@/src/components/global/Location'
import {parseDate} from '@internationalized/date'
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
  sendDataCallback: (isPublished: boolean) => void
  takeBy: string
  setTakeBy: (date: string) => void
}

export default function PayrollCreateNote({
  locations,
  locationsToHide,
  moneyOnLocations,
  payrollData,
  updateLocationMoneyCallback,
  sendDataCallback,
  takeBy,
  setTakeBy,
}: PayrollCreateNoteProps) {
  return (
    <div className="glass sticky top-20 z-1000 grid grid-flow-col grid-rows-3 gap-2 p-1">
      {/*<div className="glass grid auto-rows-auto grid-cols-3 gap-2 rounded-2xl p-2">*/}
      {/*<p className="text-center">Локация</p>*/}
      {/*<p className="bg-content2 rounded-lg text-center">Начало</p>*/}
      {/*<p className="bg-content2 rounded-lg text-center">Остаток</p>*/}
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
                <p
                  className={`${(locationMoney || 0) - usedMoney < 0 ? 'text-danger' : ''} bg-content2 flex h-10 w-full items-center justify-start rounded-xl px-2 text-sm whitespace-normal`}>
                  {separateNumber((locationMoney || 0) - usedMoney)}
                </p>
              </div>
            </div>
          )
        })}
      {/*</div>*/}
      {/*<div className="glass p-2">*/}
      {/*  <p>Можно забрать до</p>*/}
      {/*  <DatePicker*/}
      {/*    // @ts-ignore*/}
      {/*    value={parseDate(takeBy)}*/}
      {/*    // @ts-ignore*/}
      {/*    onChange={d => setTakeBy(d?.toString() || '')}*/}
      {/*  />*/}
      {/*</div>*/}
      {/*<div className="glass flex gap-2 p-2">*/}
      {/*  <Button*/}
      {/*    className="col-span-full w-full"*/}
      {/*    variant="secondary"*/}
      {/*    onPress={() => sendDataCallback(false)}>*/}
      {/*    <Icon icon="solar:diskette-bold" width="24" height="24" />*/}
      {/*    Сохранить*/}
      {/*  </Button>*/}
      {/*  <Button*/}
      {/*    className="col-span-full w-full"*/}
      {/*    variant="primary"*/}
      {/*    onPress={() => sendDataCallback(true)}>*/}
      {/*    <Icon icon="solar:plain-bold" width="24" height="24" />*/}
      {/*    Опубликовать*/}
      {/*  </Button>*/}
      {/*</div>*/}
    </div>
  )
}
