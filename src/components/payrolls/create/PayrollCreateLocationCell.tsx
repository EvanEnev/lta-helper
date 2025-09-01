import {LTLocation} from '@/src/utils/types'
import LocationSelect from '@/src/components/global/LocationSelect'
import {memo} from 'react'

interface PayrollCreateLocationCellProps {
  callback: (location: LTLocation) => void
  locations: LTLocation[]
}

export default memo(function PayrollCreateLocationCell({
  callback,
  locations,
}: PayrollCreateLocationCellProps) {
  console.debug('payrollCreateLocationCell')
  return (
    <LocationSelect
      locationId={-1}
      className="h-full"
      callback={callback}
      locations={locations}
      exclude={['другое', 'выезд', 'отдел продаж']}
    />
  )
})
