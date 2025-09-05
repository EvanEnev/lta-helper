import {LTLocation, LTWorker} from '@/src/utils/types'
import LocationSelect from '@/src/components/global/LocationSelect'
import {memo, useCallback} from 'react'

interface PayrollCreateLocationCellProps {
  callback: (
    workerId: LTWorker['id'],
    location: LTLocation['id'],
    type: 'location' | 'bonuses' | 'fines' | 'value',
  ) => void
  locations: LTLocation[]
  workerId: number
}

export default memo(function PayrollCreateLocationCell({
  callback,
  locations,
  workerId,
}: PayrollCreateLocationCellProps) {
  const locationCallback = useCallback(
    (location: LTLocation) => {
      callback(workerId, location.id, 'location')
    },
    [callback, workerId],
  )

  return (
    <LocationSelect
      locationId={-1}
      labelPlacement={'inside'}
      className="h-full flex-1"
      callback={locationCallback}
      locations={locations}
      exclude={['другое', 'выезд', 'отдел продаж']}
    />
  )
})
