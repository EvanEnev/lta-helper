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
  locationId: LTLocation['id']
}

export default memo(function PayrollCreateLocationCell({
  callback,
  locations,
  workerId,
  locationId
}: PayrollCreateLocationCellProps) {
  const locationCallback = useCallback(
    (location: LTLocation | null) => {
      callback(workerId, location!.id, 'location')
    },
    [callback, workerId],
  )

  return (
    <LocationSelect
        dynamicLocationId={true}
      locationId={locationId}
      labelPlacement={'inside'}
      className="h-full flex-1"
      callback={locationCallback}
      locations={locations}
      exclude={['другое', 'выезд', 'отдел продаж']}
    />
  )
})
