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
  locationId,
}: PayrollCreateLocationCellProps) {
  const locationCallback = useCallback(
    (location: LTLocation | null) => {
      callback(workerId, location?.id || -1, 'location')
    },
    [callback, workerId],
  )

  return (
    <LocationSelect
      useShortNames
      dynamicLocationId={true}
      locationId={locationId}
      showLabel={false}
      className="h-full min-w-[8rem] flex-1"
      callback={locationCallback}
      locations={locations}
      exclude={['другое', 'выезд', 'отдел продаж']}
    />
  )
})
