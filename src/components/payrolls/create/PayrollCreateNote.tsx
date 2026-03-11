import {Button, Code, DatePicker, Divider, Input} from '@heroui/react'
import {Fragment} from 'react'
import Location from '@/src/components/global/Location'
import {parseDate} from '@internationalized/date'
import {LTLocation, LTPayrollData} from '@/src/utils/types'
import separateNumber from '@/lib/functions/separateNumber'
import {Icon} from '@iconify/react'

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
  sendDataCallback: () => void
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
    <div className="sticky top-2 flex h-fit max-h-[87vh] min-w-70 flex-col gap-2 overflow-y-auto">
      <div className="glass grid auto-rows-auto grid-cols-3 gap-2 rounded-2xl p-2">
        <p className="text-center">Локация</p>
        <Code color="primary" className="text-center">
          Начало
        </Code>
        <Code color="success" className="text-center">
          Остаток
        </Code>
        {locations
          .filter(l => !locationsToHide.includes(l.name.toLowerCase()))
          .map(location => {
            const locationData = moneyOnLocations.find(
              d => d.location === location.id,
            )!

            const locationMoney = locationData.value || 0

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
              <Fragment key={location.id}>
                <Divider className="col-span-full" />
                <Location locationName={location.shortName!} />
                <Input
                  color={locationData.error ? 'danger' : 'primary'}
                  defaultValue={locationMoney.toString()}
                  onValueChange={value =>
                    updateLocationMoneyCallback(location.id, value)
                  }
                />
                <Code
                  className="flex h-10 items-center"
                  color={locationMoney - usedMoney < 0 ? 'danger' : 'success'}>
                  {separateNumber(locationMoney - usedMoney)}
                </Code>
              </Fragment>
            )
          })}
      </div>
      <div className="glass p-2">
        <p>Можно забрать до</p>
        <DatePicker
          // @ts-ignore
          value={parseDate(takeBy)}
          // @ts-ignore
          onChange={d => setTakeBy(d?.toString() || '')}
        />
      </div>
      <div className="glass p-2">
        <Button
          startContent={
            <Icon icon="solar:plain-linear" width="24" height="24" />
          }
          className="col-span-full w-full"
          variant="shadow"
          color="primary"
          onPress={sendDataCallback}>
          Отправить
        </Button>
      </div>
    </div>
  )
}
