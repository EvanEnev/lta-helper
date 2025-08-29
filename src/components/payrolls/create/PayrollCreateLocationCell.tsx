import {LTLocation} from '@/src/utils/types'
import LocationSelect from '@/src/components/global/LocationSelect'

interface PayrollCreateLocationCellProps {
  callback: (location: LTLocation) => void
  locations: LTLocation[]
}

export default function PayrollCreateLocationCell({
  callback,
  locations,
}: PayrollCreateLocationCellProps) {
  return (
    <LocationSelect
      locationId={-1}
      className="h-full"
      callback={callback}
      locations={locations}
      exclude={['другое', 'выезд', 'отдел продаж']}
    />
  )
}
